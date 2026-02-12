<?php
// submit-application.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Prepare email content
    $to = 'your-email@gmail.com';  // CHANGE THIS TO YOUR EMAIL
    $subject = 'New Espada Clan Application - ' . $data['name'];
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1a0000; padding: 30px; border-radius: 10px; border: 2px solid #DC143C; }
            h2 { color: #DC143C; }
            .field { margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C; }
            .label { color: #DC143C; font-weight: bold; }
            .value { color: #d1d1d1; margin-top: 5px; }
            .ip-box { background: #DC143C; color: #000; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>🔥 New Espada Application</h2>
            
            <div class='field'>
                <div class='label'>Applicant Name/Codename:</div>
                <div class='value'>{$data['name']}</div>
            </div>
            
            <div class='field'>
                <div class='label'>Age:</div>
                <div class='value'>{$data['age']}</div>
            </div>
            
            <div class='field'>
                <div class='label'>Discord ID:</div>
                <div class='value'>{$data['discord']}</div>
            </div>
            
            <div class='field'>
                <div class='label'>Combat Experience:</div>
                <div class='value'>{$data['experience']}</div>
            </div>
            
            <div class='field'>
                <div class='label'>Why Espada:</div>
                <div class='value'>{$data['reason']}</div>
            </div>
            
            <div class='field'>
                <div class='label'>Submitted At:</div>
                <div class='value'>{$data['timestamp']}</div>
            </div>
            
            <br>
            <div class='ip-box'>
                📍 Applicant IP Address: {$data['ip']}
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Espada Recruitment <noreply@espadaclan.com>' . "\r\n";
    
    // Send email
    $emailSent = mail($to, $subject, $message, $headers);
    
    // Also save to JSON file (optional)
    $applicationsFile = 'applications.json';
    $applications = file_exists($applicationsFile) ? json_decode(file_get_contents($applicationsFile), true) : [];
    $applications[] = $data;
    file_put_contents($applicationsFile, json_encode($applications, JSON_PRETTY_PRINT));
    
    if ($emailSent) {
        echo json_encode(['success' => true, 'message' => 'Application submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email failed but application saved']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
