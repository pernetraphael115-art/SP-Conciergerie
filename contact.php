<?php
// contact.php - Traitement du formulaire SP Conciergerie

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// Récupération et nettoyage des données
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// Handle cases where frontend sends 'Non renseigné'
if ($email === 'Non renseigné') $email = '';
if ($phone === 'Non renseigné') $phone = '';

// Validation de base (vérifiée aussi côté JS)
if (empty($name) || (empty($email) && empty($phone))) {
    echo json_encode(["status" => "error", "message" => "Veuillez renseigner votre nom et un moyen de contact."]);
    exit;
}

// 1. E-mail destiné à Sandra (Propriétaire)
$to = "contact@spconcierge.fr"; 
$subject = "Nouvelle demande de contact - SP Conciergerie";

$body = "Vous avez reçu une nouvelle demande de contact depuis le site SP Conciergerie.\n\n";
$body .= "Nom : $name\n";
$body .= "Email : " . ($email ? $email : "Non renseigné") . "\n";
$body .= "Téléphone : " . ($phone ? $phone : "Non renseigné") . "\n";
$body .= "Message :\n$message\n";

$headers = "From: contact@spconcierge.fr\r\n";
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $email\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Envoi du mail à Sandra
$mailSent = mail($to, $subject, $body, $headers);

// 2. Auto-réponse au client (seulement si un email valide a été fourni)
if ($mailSent && !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $clientSubject = "Votre demande auprès de SP Conciergerie";
    
    $clientBody = "Bonjour $name,\n\n";
    $clientBody .= "Nous vous remercions pour votre message et l'intérêt que vous portez à SP Conciergerie.\n\n";
    $clientBody .= "Votre demande a bien été transmise. Sandra l'étudie avec la plus grande attention et reviendra vers vous personnellement dans les meilleurs délais pour échanger sur vos envies et vous proposer un accompagnement sur mesure.\n\n";
    $clientBody .= "Dans l'attente de ce prochain contact, nous restons à votre entière disposition.\n\n";
    $clientBody .= "L'excellence à votre service.\n\n";
    $clientBody .= "Bien à vous,\n\n";
    $clientBody .= "L'équipe SP Conciergerie\n";
    $clientBody .= "Saint-Tropez | Paris | Courchevel\n";
    $clientBody .= "contact@spconcierge.fr | +33 6 42 25 56 92\n";
    $clientBody .= "https://spconcierge.fr";

    $clientHeaders = "From: contact@spconcierge.fr\r\n";
    $clientHeaders .= "Reply-To: contact@spconcierge.fr\r\n";
    $clientHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Envoi de l'auto-réponse
    mail($email, $clientSubject, $clientBody, $clientHeaders);
}

if ($mailSent) {
    echo json_encode(["status" => "success", "message" => "Message envoyé avec succès."]);
} else {
    echo json_encode(["status" => "error", "message" => "Une erreur est survenue lors de l'envoi de l'e-mail."]);
}
?>
