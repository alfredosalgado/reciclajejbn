<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Configuration
$to_email = 'contacto@reciclajesjbn.cl';
$from_email = 'noreply@reciclajesjbn.cl';
$subject_prefix = '[Reciclajes JBN] Nueva consulta desde el sitio web';

// Validate and sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    // Chilean phone number validation
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return preg_match('/^(\+56|56)?[0-9]{8,9}$/', $phone);
}

// Get and validate form data
$errors = [];
$data = [];

// Required fields
$required_fields = ['nombre', 'email', 'telefono', 'material'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        $errors[] = "El campo {$field} es requerido";
    } else {
        $data[$field] = sanitize_input($_POST[$field]);
    }
}

// Optional fields
$optional_fields = ['empresa', 'mensaje'];
foreach ($optional_fields as $field) {
    $data[$field] = isset($_POST[$field]) ? sanitize_input($_POST[$field]) : '';
}

// Specific validations
if (!empty($data['email']) && !validate_email($data['email'])) {
    $errors[] = 'El email no tiene un formato válido';
}

if (!empty($data['telefono']) && !validate_phone($data['telefono'])) {
    $errors[] = 'El teléfono no tiene un formato válido';
}

// Check for errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Errores de validación',
        'errors' => $errors
    ]);
    exit;
}

// Prepare email content
$email_subject = $subject_prefix . ' - ' . $data['material'];

$email_body = "
Nueva consulta recibida desde el sitio web de Reciclajes JBN

DATOS DEL CLIENTE:
==================
Nombre: {$data['nombre']}
Empresa: " . ($data['empresa'] ?: 'No especificada') . "
Email: {$data['email']}
Teléfono: {$data['telefono']}
Tipo de Material: {$data['material']}

MENSAJE:
========
" . ($data['mensaje'] ?: 'Sin mensaje adicional') . "

INFORMACIÓN ADICIONAL:
=====================
Fecha y hora: " . date('d/m/Y H:i:s') . "
IP del cliente: " . $_SERVER['REMOTE_ADDR'] . "
User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "

---
Este mensaje fue enviado automáticamente desde el formulario de contacto del sitio web.
";

// Email headers
$headers = [
    'From: ' . $from_email,
    'Reply-To: ' . $data['email'],
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// Try to send email
$mail_sent = false;

// Method 1: Try with mail() function
if (function_exists('mail')) {
    $mail_sent = mail($to_email, $email_subject, $email_body, implode("\r\n", $headers));
}

// Method 2: If mail() fails, try with sendmail (if available)
if (!$mail_sent && function_exists('exec')) {
    $sendmail_path = '/usr/sbin/sendmail';
    if (file_exists($sendmail_path)) {
        $email_content = "To: {$to_email}\r\n";
        $email_content .= "Subject: {$email_subject}\r\n";
        $email_content .= implode("\r\n", $headers) . "\r\n\r\n";
        $email_content .= $email_body;
        
        $process = popen("{$sendmail_path} -t", 'w');
        if ($process) {
            fwrite($process, $email_content);
            $result = pclose($process);
            $mail_sent = ($result === 0);
        }
    }
}

// Log the submission (for backup/debugging)
$log_entry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'data' => $data,
    'mail_sent' => $mail_sent
];

$log_file = 'contact_submissions.log';
file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);

// Prepare response
if ($mail_sent) {
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
    ]);
} else {
    // Email failed, but we still logged the submission
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el email. Tu consulta ha sido registrada y nos pondremos en contacto contigo pronto.',
        'fallback' => true
    ]);
}

// Auto-response email to the client
$auto_response_subject = 'Confirmación de recepción - Reciclajes JBN';
$auto_response_body = "
Estimado/a {$data['nombre']},

Hemos recibido tu consulta sobre {$data['material']} y nos pondremos en contacto contigo a la brevedad.

RESUMEN DE TU CONSULTA:
======================
Nombre: {$data['nombre']}
Email: {$data['email']}
Teléfono: {$data['telefono']}
Tipo de Material: {$data['material']}

Nuestro equipo revisará tu solicitud y te contactaremos dentro de las próximas 24 horas hábiles.

Para consultas urgentes, puedes contactarnos directamente:
- Teléfono: +56 9 7120 4381
- WhatsApp: https://wa.me/56971204381
- Email: contacto@reciclajesjbn.cl

Gracias por confiar en Reciclajes JBN.

Saludos cordiales,
Equipo Reciclajes JBN
\"Retiramos y reciclamos el material excedente\"
";

$auto_response_headers = [
    'From: ' . $from_email,
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// Send auto-response (optional, don't fail if it doesn't work)
if (function_exists('mail')) {
    @mail($data['email'], $auto_response_subject, $auto_response_body, implode("\r\n", $auto_response_headers));
}
?>

