/*define base variables*/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;
const redis = require('redis');
const client = redis.createClient('6379','127.0.0.1');
const bodyParser = require('body-parser');
sadd
app.use(bodyParser.json()); 
var clients =[];
var getClearClient = () =>{
        return {
        clientId : '',
        socketId:'',
        socket:''
      };
}
var getClearMsg = () =>{
	 return {
        msg:'',
        broadcast:false,
        toIds:[]
      };
}
/*end define base variables*/
client.subscribe('notification');
client.on('message', function(channel, message){
     console.log("message from backend "+ message);
     if(message){
      var data = getClearMsg();
      data = JSON.parse(message);
      if(data.toIds && data.toIds.length > 0 && data.toIds[0].constructor === Array)
        data.toIds = data.toIds[0];
      socketReceiver(clients,data);
     }

  });
/*define routes*/
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
});

app.post('/sendmsg',(req, res) =>{
	console.log(req.body)
	var data = getClearMsg();
	data = req.body;
	socketReceiver(clients,data);
	res.json({ message: 'message recieved!' });   
});
/*end define routes*/

/*define socket connection*/
io.on('connection', (socket) =>{
	console.info("new session is open with session id = "+socket.id);
   
	/*store client credintials*/
   socket.on('storeClientInfo',(data) => {

  	    clientInfo = getClearClient();
        clientInfo.clientId = data.clientId;
        clientInfo.socketId = socket.id;
        clientInfo.socket = socket;
        // client.set(clientInfo.clientId, JSON.stringify(clientInfo))
        // client.get(clientInfo.clientId,function(err,object){
        // 	console.log(JSON.parse(object).socketId);
        // })
        clients.push(clientInfo);
        console.log('store Client Info clientId '+clientInfo.clientId+' socketId '+clientInfo.socketId);
        console.log('clients length '+clients.length);
   })
   /*end store client credintials*/

	/*client fire socket action*/
  socket.on('socket_receiver', (data) =>{
  	   		socketReceiver(clients,data);
  });
  socketReceiver =(clients , data) => {
  	console.log('clients length '+clients.length);
  	console.log('message sent '+JSON.stringify(data))
  	var msg = getClearMsg();
  	msg =  data;
  	if(msg.broadcast == true || msg.broadcast == 1){
  		clientsPushNotification(clients,msg);
  	}else{
  	io.emit('socket_client', msg.msg);
  	}
  }
  /*end client fire socket action*/

  /*clients push notification fn*/  
  clientsPushNotification = (clients,msg) => {
  	for(var client of clients){
			// console.log("client"+JSON.stringify(client))
			for(var id of msg.toIds){
				if(client.clientId == id){
					console.log('matched client '+id)
					client.socket.emit('socket_client', msg.msg);
					// socket.broadcast.to(client.socketId).emit('socket_client', msg.msg);		
					break;
				}		
			}
		}
  }
    /*end clients push notification fn*/  
  

   // Log whenever a client disconnects from our websocket server
    socket.on('disconnect', () => {
		console.log("clients before "+clients.length);
		  for( var i=0, len=clients.length; i<len; ++i ){
	            var c = clients[i];
	            if(c.socketId == socket.id){
	            	console.log('use id '+c.clientId+' socket id '+c.socketId+' disconnected');
	                clients.splice(i,1);
	                break;
	            }
	        }
        console.log("after before "+clients.length);
    });
    // e whenever a client disconnects from our websocket server
});
/*end define socket connection*/

/*server listening*/
http.listen(port, () => {
   console.log('listening on *:' + port);
});
/*server listening*/
