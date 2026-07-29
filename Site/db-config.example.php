<?php
/**
 * Template de configuração — copie para db-config.php no servidor e preencha
 * com os valores reais. NUNCA versionar db-config.php (já está no .gitignore).
 */
define('PROJETO_PREFIX', 'promotec');
if (!defined('PROJETO_DB_HOST'))     define('PROJETO_DB_HOST',     'localhost');
if (!defined('PROJETO_DB_NAME'))     define('PROJETO_DB_NAME',     'u123456_promotec');
if (!defined('PROJETO_DB_USER'))     define('PROJETO_DB_USER',     'u123456_promotec');
if (!defined('PROJETO_DB_PASSWORD')) define('PROJETO_DB_PASSWORD', 'SENHA_DO_BANCO_AQUI');
if (!defined('PROJETO_NOTIFY'))      define('PROJETO_NOTIFY',      'andre.jose@promotecconstrutora.com.br');
if (!defined('PROJETO_ADMIN_PASS'))  define('PROJETO_ADMIN_PASS',  'TROQUE_ESTA_SENHA_ANTES_DE_PUBLICAR');
if (!defined('PROJETO_UPLOAD_DIR'))  define('PROJETO_UPLOAD_DIR',  __DIR__ . '/uploads/arquivos/');
if (!defined('PROJETO_UPLOAD_URL'))  define('PROJETO_UPLOAD_URL',  '/uploads/arquivos/');
