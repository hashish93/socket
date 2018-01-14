# socket-notification

to install node dependencies run

 node install

then

to test front end you need to run index.html on external server or change index.js to return index.html

you can open more than one socket and the appliction will generate client id and open socket with the app

you can push notification from api to any customer if you want to broadcast or share message with all clients

to test the api on url
post request
# http://localhost:5000/sendmsg
{
	{
		"msg":"test message from rest api",
		"broadcast":true,
		"toIds":[1]
	}
}


