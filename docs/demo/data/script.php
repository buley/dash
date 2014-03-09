<?php
echo "{\n";
for ( $x = 1880; $x <= 2021; $x += 1 ) {
	$text = file_get_contents( $x . '.json' );
	$json = json_decode( $text );
	$count = count( $json );
	$size = filesize( $x . '.json' );
	echo "'$x': { 'filecount': '$count', 'filesize': '$size' }, \n";
}
echo "}\n";
