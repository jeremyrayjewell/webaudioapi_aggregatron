<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$servername = "db4free.net";
$username = "jrj_db";
$password = "5a4cfb60";
$dbname = "jrj_db_1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$bank = $_GET['bank'];

$sql = "SELECT sequence FROM sequences WHERE bank = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $bank);
$stmt->execute();
$stmt->bind_result($sequence);
$stmt->fetch();

echo json_encode($sequence);

$stmt->close();
$conn->close();
?>