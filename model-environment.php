<?php

$envVars    = explode('/', $q);
$userHandle = $envVars[1];
$envId      = $envVars[3];

require_once('php/Environment.php');
$environment = Environment::getData($envId);

if($environment) {
    $file = 'environment';
} else {
    $file = '404';
}