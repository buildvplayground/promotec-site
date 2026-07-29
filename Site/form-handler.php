<?php
/**
 * Recebe os formulários de Fornecedores e Trabalhe Conosco.
 * Responde sempre em JSON. Nunca expõe detalhes internos de erro ao cliente.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(bool $success, string $message, int $httpCode = 200): void {
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método não permitido.', 405);
}

$configFile = __DIR__ . '/db-config.php';
$hasDb = file_exists($configFile);
if ($hasDb) {
    require_once $configFile;
} else {
    // Ambiente sem banco provisionado ainda (dev/preview) — segue em modo
    // degradado: valida, trata upload e grava em log local; não insere no banco.
    if (!defined('PROJETO_NOTIFY')) define('PROJETO_NOTIFY', '');
    if (!defined('PROJETO_UPLOAD_DIR')) define('PROJETO_UPLOAD_DIR', __DIR__ . '/uploads/arquivos/');
}

$formType = $_POST['form_type'] ?? '';
if (!in_array($formType, ['fornecedor', 'candidato'], true)) {
    respond(false, 'Tipo de formulário inválido.', 400);
}

function reqField(string $key): string {
    $v = trim((string)($_POST[$key] ?? ''));
    return $v;
}

$email = reqField('email');
$nome = reqField('nome');
$telefone = reqField('telefone');

if ($nome === '' || $telefone === '') {
    respond(false, 'Preencha nome e telefone.', 422);
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Informe um e-mail válido.', 422);
}

$data = ['form_type' => $formType, 'nome' => $nome, 'email' => $email, 'telefone' => $telefone];

if ($formType === 'fornecedor') {
    $produto = reqField('produto');
    $empresa = reqField('empresa');
    if ($produto === '' || $empresa === '') {
        respond(false, 'Preencha produto/serviço e empresa.', 422);
    }
    $data['produto'] = $produto;
    $data['empresa'] = $empresa;
} else {
    $area = reqField('area');
    if ($area === '') {
        respond(false, 'Selecione uma área de interesse.', 422);
    }
    $data['area'] = $area;
}

// ---------------------------------------------------------------------
// Upload de arquivo (opcional) — validado por extensão + MIME real + tamanho
// ---------------------------------------------------------------------
$data['arquivo'] = null;
if (!empty($_FILES['arquivo']['name']) && $_FILES['arquivo']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['arquivo'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(false, 'Falha no envio do arquivo.', 422);
    }
    $maxBytes = 5 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        respond(false, 'O arquivo excede o limite de 5 MB.', 422);
    }
    $allowedExt = ['pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!array_key_exists($ext, $allowedExt)) {
        respond(false, 'Formato de arquivo não permitido. Envie PDF, DOC ou DOCX.', 422);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    // DOC/DOCX antigos podem reportar application/octet-stream em alguns sistemas —
    // aceita octet-stream apenas quando a extensão já bateu na whitelist acima.
    $mimeOk = ($mime === $allowedExt[$ext]) || ($mime === 'application/octet-stream' && $ext !== 'pdf')
        || ($ext === 'docx' && $mime === 'application/zip');
    if (!$mimeOk) {
        respond(false, 'O conteúdo do arquivo não corresponde ao formato esperado.', 422);
    }
    if (!is_dir(PROJETO_UPLOAD_DIR)) {
        @mkdir(PROJETO_UPLOAD_DIR, 0755, true);
    }
    $randomName = bin2hex(random_bytes(16)) . '.' . $ext;
    $dest = rtrim(PROJETO_UPLOAD_DIR, '/') . '/' . $randomName;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        respond(false, 'Não foi possível salvar o arquivo enviado.', 500);
    }
    @chmod($dest, 0644);
    $data['arquivo'] = $randomName;
}

// ---------------------------------------------------------------------
// Persistência: banco (se provisionado) + log local de fallback
// ---------------------------------------------------------------------
$savedToDb = false;
if ($hasDb && defined('PROJETO_DB_HOST')) {
    try {
        $dsn = 'mysql:host=' . PROJETO_DB_HOST . ';dbname=' . PROJETO_DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, PROJETO_DB_USER, PROJETO_DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("CREATE TABLE IF NOT EXISTS submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            form_type VARCHAR(20) NOT NULL,
            nome VARCHAR(160) NOT NULL,
            email VARCHAR(160) NOT NULL,
            telefone VARCHAR(40) NOT NULL,
            produto VARCHAR(200) NULL,
            empresa VARCHAR(200) NULL,
            area VARCHAR(60) NULL,
            arquivo VARCHAR(120) NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $stmt = $pdo->prepare("INSERT INTO submissions
            (form_type, nome, email, telefone, produto, empresa, area, arquivo)
            VALUES (:form_type, :nome, :email, :telefone, :produto, :empresa, :area, :arquivo)");
        $stmt->execute([
            ':form_type' => $data['form_type'],
            ':nome' => $data['nome'],
            ':email' => $data['email'],
            ':telefone' => $data['telefone'],
            ':produto' => $data['produto'] ?? null,
            ':empresa' => $data['empresa'] ?? null,
            ':area' => $data['area'] ?? null,
            ':arquivo' => $data['arquivo'],
        ]);
        $savedToDb = true;
    } catch (Throwable $e) {
        // Banco indisponível/ainda não provisionado — segue para o log local,
        // não expõe detalhes do erro ao cliente.
        $savedToDb = false;
    }
}

if (!$savedToDb) {
    $logDir = dirname(rtrim(PROJETO_UPLOAD_DIR, '/'));
    if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
    $logLine = json_encode(array_merge($data, ['criado_em' => date('c')]), JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents($logDir . '/submissions.log', $logLine, FILE_APPEND | LOCK_EX);
}

// ---------------------------------------------------------------------
// Notificação por e-mail (melhor esforço — não falha a requisição)
// ---------------------------------------------------------------------
if (defined('PROJETO_NOTIFY') && PROJETO_NOTIFY !== '') {
    $subject = $formType === 'fornecedor'
        ? 'Novo cadastro de fornecedor — site Promotec'
        : 'Nova candidatura — site Promotec';
    $body = "Novo envio pelo site:\n\n" . implode("\n", array_map(
        fn($k, $v) => $k . ': ' . (string)($v ?? '-'),
        array_keys($data), $data
    ));
    @mail(PROJETO_NOTIFY, $subject, $body, 'Content-Type: text/plain; charset=utf-8');
}

respond(true, $formType === 'fornecedor'
    ? 'Cadastro enviado! Entraremos em contato em breve.'
    : 'Candidatura enviada! Entraremos em contato em breve.');
