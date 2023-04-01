<?php
/*
 _   __                          _ 
| | / /                         | |
| |/ /  ___  _ __  _ __ __ _  __| |
|    \ / _ \| '_ \| '__/ _` |/ _` |
| |\  \ (_) | | | | | | (_| | (_| |
\_| \_/\___/|_| |_|_|  \__,_|\__,_|
*/
require '../config/config.php';
header("Access-Control-Allow-Origin: *");
header("Content-type: text/json");
$x = time() * 1000; 

$tx1 = file_get_contents("/sys/class/net/{$interface}/statistics/tx_bytes");
$rx1 = file_get_contents("/sys/class/net/{$interface}/statistics/rx_bytes");
sleep(1);
$tx2 = file_get_contents("/sys/class/net/{$interface}/statistics/tx_bytes");
$rx2 = file_get_contents("/sys/class/net/{$interface}/statistics/rx_bytes");



if($datatype == 'RX'){
	if($num == 'EU'){
		
		
	$y = ($rx2-$rx1);
	$ret = array($x, $y);
	echo json_encode($ret);
	
	}
	elseif($num == 'US'){
		
		
	$y = ($rx2-$rx1)*8;
	$ret = array($x, $y);
	echo json_encode($ret);
	
	}
	else{
		echo 'CONFIGURATION ERROR - ERREUR CONFIG (num)';	
	}

}


elseif($datatype == 'TX'){
	
	if($num == 'EU'){
		
		
	$y = ($tx2-$tx1);
	$ret = array($x, $y);
	echo json_encode($ret);
	
	}
	elseif($num == 'US'){
	$y = ($tx2-$tx1)*8;
	$ret = array($x, $y);
	echo json_encode($ret);
	
	}
	else{
		echo 'CONFIGURATION ERROR - ERREUR CONFIG (num)';	
	}
}



else{
	echo 'CONFIGURATION ERROR - ERREUR CONFIG (datatype)';
	
}


?>