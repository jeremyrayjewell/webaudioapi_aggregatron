<?php
$servername = "db4free.net";
$username = "jrj_db";
$password = "5a4cfb60";
$dbname = "jrj_db_1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$bank = $_POST['bank'];
$sequence = $_POST['sequence'];

$sql = "REPLACE INTO sequences (bank, sequence) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $bank, $sequence);

if ($stmt->execute()) {
  echo "Sequence saved successfully";
} else {
  echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>