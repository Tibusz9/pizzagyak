<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$servername = 'localhost';
$username = 'pizza12';
$password = 'Pizza12.';
$dbname = 'pizza12';

$conn = new mysqli($servername, $username, $password, $dbname);
