<?php

$milestone_id = 41;

date_default_timezone_set( 'America/New_York' );

function get_github_issues_page( $milestone = 41, $page = 1 ) {
	$url = 'https://api.github.com/repos/paradedev/cms/issues?milestone=' . $milestone . '&page=' . $page;
	$username = 'editor';
	$password = 'RWza2JOkFM';
	$process = curl_init($url);
	curl_setopt($process, CURLOPT_HEADER, 0);
	curl_setopt($process, CURLOPT_USERPWD, $username . ":" . $password);
	curl_setopt($process, CURLOPT_HTTPHEADER, array() );
	curl_setopt($process, CURLOPT_USERAGENT, 'Parade.com Github' );
	curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
	$return = curl_exec($process);
	curl_close($process);
	return json_decode( $return );
}

$issues = array();
$problems = array();
$milestone = array();
$issues_by_dev = array();
$by_dev = array();
$labels = array();
$labels_by_dev = array();
$body = '';
foreach( array( 1, 2, 3 ) as $page ) {
	foreach( get_github_issues_page( $milestone_id, $page ) as $issue ) {
		array_push( $issues, $issue );
	}
}
foreach ( $issues as $issue ) {
	$issue_body = '';
	$issue_body_extras = '';
	if ( true === empty( $milestone ) ) {
		$milestone = $issue->milestone;
	}
	if ( true !== empty( $issue->title ) ) {
		$issue_body .= $issue->title . "\n";
	} else {
		$problems[] = $issue->html_url . " needs a title";
	}
	$issue_body .= $issue->html_url . "\n";
	if ( false === empty( $issue->labels ) ) {
		foreach ( $issue->labels as $label ) {
			$issue_body_extras .= $label->name . " ";
			if (false === isset($labels[$label->name]) ) {
				$labels[$label->name] = 1;
			} else {
				$labels[$label->name] += 1;
			}
		}
		$issue_body_extras .= "\n";
	} else {
		$problems[] = $issue->html_url . " needs labeling";
	}

	if ( false === empty( $issue->assignee ) && false === empty( $issue->assignee->login ) ) {
		if (false === isset($by_dev[ $issue->assignee->login ]) ) {
			$by_dev[ $issue->assignee->login ] = 1;
		} else {
			$by_dev[ $issue->assignee->login ] += 1;
		}
		$issue_body_extras .= '@' . $issue->assignee->login . "\n";
		if (false === isset($issues_by_dev[ $issue->assignee->login ]) ) {
			$issues_by_dev[ $issue->assignee->login ] = array( $issue_body );
		} else {
			$issues_by_dev[ $issue->assignee->login ][] = $issue_body;;
		}	
	} else {
		$problems[] = $issue->html_url . " needs assigning";
	}
	
	$body .= $issue_body . $issue_body_extras . "\n";
}

arsort($labels);
arsort($by_dev);
$header = '';
$header .= '# ' . $milestone->title . "\n";
$header .= "### Due: " . date('m-d-Y', strtotime( $milestone->due_on ) ) . "\n";
$header .= "### Completion: " . $milestone->open_issues / $milestone->closed_issues . "%\n\n";
$ct = 0;

$total_issues = 0;

foreach( $by_dev as $dev=>$count ) {
	$total_issues += $count;
}
if ( count( $by_dev ) > 0 ) {
	$header .= "## By Developer\n";
}
foreach( $by_dev as $dev=>$count ) {
	$header .= "* $dev: " . number_format( $count / $total_issues, 2 ) * 100 . "%\n";
	$user_ct = number_format( $count / $total_issues, 2 );
	$fair = $total_issues / count( $by_dev );
	$fair_min = ( $fair - ( ( 1 / count( $by_dev ) ) * $fair ) ) / 100;
	$fair_max = ( $fair + ( ( 1 / count( $by_dev ) ) * $fair ) ) / 100;
	if ( $user_ct > $fair_max ) {
		$problems[] = "$dev ($user_ct) has more than a fair share ($fair_max) of issues";
	} else if ( $user_ct < $fair_min ) {
		$problems[] = "$dev ($user_ct) has less than a fair share ($fair_min) of issues";
	}
}
if ( count( $by_dev ) > 0 ) {
	$header .= "\n";
}

if (false === empty($problems)) {
	$header .= "## Problems:\n";
	foreach ($problems as $problem ) {
		$header .= "* " . $problem . "\n";
	}
	$header .= "\n";
}

if ( count( $labels ) > 0 ) {
	$header .= "## Labels\n";
}
foreach ( $labels as $label=>$total ) {
	if ( ( ++$ct % 4 ) === 0 ) {
		$header .= "$label: $total";
		if ( $ct !== count($labels) ) {
			$header .= "\n";
		}
	} else {
		$header .= "$label: $total";
		if ( $ct !== count($labels) ) {
			$header .= " | ";
		}
	}
}
if ( count( $labels ) > 0 ) {
	$header .= "\n\n";
}
echo $header;
$body = "## By Issue\n" . $body;
$body .= "## By Developer\n\n";
foreach ( $issues_by_dev as $dev => $issues ) {
	$body .= "## $dev's Issues\n\n";
	foreach( $issues as $issue ) {
		$body .= $issue . "\n";
	}
	$body .= "\n";
}
echo $body;

