#! /bin/bash

#this is a bash script that starts the server for the website

#check for root
if [ "$EUID" -ne 0 ]; then
	echo "[-] Run as root."
	exit
fi

#*************************************************
#RUN ALL OF THE SERVER PROCESSES IN THE BACKGROUND
#*************************************************
echo "[**] Starting Server Processes..."
#start nginx with the configuration file for the site instead of the default
nginx -c /etc/nginx/nginx_crumb.conf &
#run the redis server with the configuration file for storing sessions
redis-server /etc/redis/redis_session.conf &
#start the node js server
npm run dev &

#**************************************
#HANDLE THE KILLING OF SERVER PROCESSES
#**************************************
#function for when we want to exit the script
function ctrl_c() {
	echo -e "\n\n[**] Killing Server Processes..."
	killall node
	killall redis-server
	killall nginx
	echo "[+] Killed all server processes. Exiting now..."
	exit
}
#trap the Ctrl+C command and execute a function which kills the server processes
trap ctrl_c SIGINT SIGTSTP SIGQUIT

#a while loop with the sleep command is essential as the command needs to keep running
#without exiting in order for the program to detect a Ctrl+C
while true
do
	sleep 10
done
