<?php
/**
 * Painel simples e protegido por senha para ver os envios de
 * Fornecedores / Trabalhe Conosco. Sem framework, sem dependências.
 */
declare(strict_types=1);
session_start();

$configFile = __DIR__ . '/db-config.php';
if (file_exists($configFile)) {
    require_once $configFile;
}
if (!defined('PROJETO_ADMIN_PASS')) {
    define('PROJETO_ADMIN_PASS', null);
}

function h(?string $v): string {
    return htmlspecialchars((string)($v ?? ''), ENT_QUOTES, 'UTF-8');
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

if (isset($_POST['senha'])) {
    if (PROJETO_ADMIN_PASS !== null && hash_equals((string)PROJETO_ADMIN_PASS, (string)$_POST['senha'])) {
        $_SESSION['promotec_admin'] = true;
    } else {
        $loginError = 'Senha incorreta.';
    }
}

$authenticated = !empty($_SESSION['promotec_admin']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Promotec</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root{ --navy:#14385F; --red:#DB0F22; --gray-100:#F4F5F6; --gray-200:#E7E9EB; --gray-600:#5B6066; }
  *{ box-sizing:border-box; }
  body{ font-family:system-ui,-apple-system,sans-serif; margin:0; background:var(--gray-100); color:var(--navy); }
  .wrap{ max-width:1100px; margin:0 auto; padding:40px 24px; }
  h1{ font-size:1.4rem; margin:0 0 6px; }
  .sub{ color:var(--gray-600); font-size:.9rem; margin-bottom:28px; }
  .login-card{ max-width:360px; margin:80px auto; background:#fff; border:1px solid var(--gray-200); border-radius:12px; padding:32px; }
  .login-card input{ width:100%; padding:12px 14px; border:1.5px solid var(--gray-200); border-radius:8px; font-size:.95rem; margin:14px 0; }
  .login-card button{ width:100%; padding:12px; border:0; border-radius:999px; background:var(--red); color:#fff; font-weight:700; cursor:pointer; }
  .error{ color:#8a2020; font-size:.85rem; }
  table{ width:100%; border-collapse:collapse; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 8px 24px -12px rgba(20,56,95,.18); }
  th,td{ padding:10px 14px; border-bottom:1px solid var(--gray-200); font-size:.85rem; text-align:left; vertical-align:top; }
  th{ background:var(--navy); color:#fff; font-weight:600; position:sticky; top:0; }
  tr:last-child td{ border-bottom:none; }
  .badge{ display:inline-block; padding:2px 10px; border-radius:999px; font-size:.72rem; font-weight:700; }
  .badge.fornecedor{ background:#e7f0fb; color:var(--navy); }
  .badge.candidato{ background:#fdeceb; color:var(--red); }
  .top-actions{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
  .top-actions a{ color:var(--gray-600); font-size:.85rem; }
  .empty{ padding:40px; text-align:center; color:var(--gray-600); background:#fff; border-radius:10px; }
  .notice{ background:#fff8e6; border:1px solid #f0d78c; color:#7a5b00; padding:10px 16px; border-radius:8px; font-size:.82rem; margin-bottom:18px; }
</style>
</head>
<body>
<?php if (!$authenticated): ?>
  <div class="login-card">
    <h1>Área restrita</h1>
    <p class="sub">Painel de envios — Promotec</p>
    <?php if (!empty($loginError)): ?><p class="error"><?= h($loginError) ?></p><?php endif; ?>
    <form method="post">
      <input type="password" name="senha" placeholder="Senha" required autofocus>
      <button type="submit">Entrar</button>
    </form>
  </div>
<?php else: ?>
  <div class="wrap">
    <div class="top-actions">
      <div>
        <h1>Envios do site</h1>
        <p class="sub">Fornecedores e Trabalhe Conosco</p>
      </div>
      <a href="?logout=1">Sair</a>
    </div>
    <?php
    $rows = [];
    $mode = 'banco';
    try {
        if (!defined('PROJETO_DB_HOST')) { throw new RuntimeException('sem config'); }
        $dsn = 'mysql:host=' . PROJETO_DB_HOST . ';dbname=' . PROJETO_DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, PROJETO_DB_USER, PROJETO_DB_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $stmt = $pdo->query('SELECT * FROM submissions ORDER BY criado_em DESC LIMIT 500');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $mode = 'log-local';
        $logFile = (defined('PROJETO_UPLOAD_DIR') ? dirname(rtrim(PROJETO_UPLOAD_DIR, '/')) : __DIR__ . '/uploads') . '/submissions.log';
        if (is_file($logFile)) {
            foreach (array_reverse(file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) as $line) {
                $row = json_decode($line, true);
                if (is_array($row)) { $rows[] = $row; }
            }
        }
    }
    ?>
    <?php if ($mode === 'log-local'): ?>
      <p class="notice">Banco de dados ainda não provisionado — exibindo os envios do log local de fallback (<code>uploads/submissions.log</code>). Assim que o banco MySQL for criado e <code>db-config.php</code> preenchido, os envios passam a ser salvos e listados a partir dele.</p>
    <?php endif; ?>
    <?php if (empty($rows)): ?>
      <div class="empty">Nenhum envio recebido ainda.</div>
    <?php else: ?>
      <table>
        <thead>
          <tr><th>Data</th><th>Tipo</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Detalhes</th><th>Arquivo</th></tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $r): ?>
          <tr>
            <td><?= h($r['criado_em'] ?? '') ?></td>
            <td><span class="badge <?= h($r['form_type'] ?? '') ?>"><?= h($r['form_type'] ?? '') ?></span></td>
            <td><?= h($r['nome'] ?? '') ?></td>
            <td><?= h($r['email'] ?? '') ?></td>
            <td><?= h($r['telefone'] ?? '') ?></td>
            <td>
              <?php if (!empty($r['produto']) || !empty($r['empresa'])): ?>
                <?= h($r['produto'] ?? '') ?> — <?= h($r['empresa'] ?? '') ?>
              <?php elseif (!empty($r['area'])): ?>
                <?= h($r['area']) ?>
              <?php endif; ?>
            </td>
            <td><?= !empty($r['arquivo']) ? '<a href="uploads/arquivos/' . h($r['arquivo']) . '" target="_blank" rel="noopener">baixar</a>' : '—' ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>
<?php endif; ?>
</body>
</html>
