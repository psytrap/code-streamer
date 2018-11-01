
// create pdf of 10x15cm




function Test_jspdf_Create()
{
	console.log("Test_jspdf_Create");
	// get url // https://i.imgur.com/ZOuqd4f.jpg // CORS bad // http://www.brooklynvegan.com/files/2018/08/aphex-twin-collapse.jpg
	var file_data = document.getElementById("cover").files[0];
	console.log(file_data);

// CORS bad	
//toDataURL(url, function(dataURL){

// TODO JFIF -> 4AAQSkZJRgABAQAAAQABAAD


//		doc.save('Test_jspdf_Create.pdf');
// console.log("KOTZ");
readFile(file_data);
//	
//});
// 'https://upload.wikimedia.org/wikipedia/commons/7/75/Information-silk.png'
//	kotz(url)

}


function readFile(file_data) {
	console.log("file " + file_data)

	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = function(event)
	{
		var imgData = event.target.result;
		var width = 0, height = 0;
		GetImageSize(imgData, function(width, height)
		{
			console.log("size " + width + "x" + height)
			var factor_x = width/Math.max(width,height);
			var factor_y = height/Math.max(width,height);
			console.log("size " + factor_x + "x" + factor_y)
			var doc = new jsPDF("landscape", "mm", [150, 100]);
			top_x = 75 - factor_x * 50;
			top_y = 50 - factor_y * 50;
			x = factor_x * 100;
			y = factor_y * 100;
			doc.addImage(imgData, top_x, top_y, x, y);
			doc.save('Test_jspdf_Create.pdf');
		});

	}; // (file);

	// Read in the image file as a data URL.
	reader.readAsDataURL(file_data);
}



function GetImageSize(image_data, callback)
{
	var img = new Image(); // document.createElement('img');
	img.src = image_data;
	img.async = false;
	img.onload = function() {
		// HATE
		// JS
		// no sync function for nanosecond operation!!!!!!!!!!!
		// HATE
		// JS
		var width = img.naturalWidth;
		var height = img.naturalHeight;
		callback(width, height);

	}

}

function toDataURL(url, callback){
    var xhr = new XMLHttpRequest();
//    xhr.header("Access-Control-Allow-Origin", "*");
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      var fr = new FileReader();
    
      fr.onload = function(){
        callback(this.result);
      };
    
      fr.readAsDataURL(xhr.response); // async call
    };
    
    xhr.send();
}

function kotz(url)
{
	console.log("aaaaaaaa " + url)
	self.addEventListener('fetch', function(event)
	{
		event.respondWith(
			fetch(url, {mode: 'no-cors'})
			  	.then(function(response) {console.log("sssss " +url + response.status) }) //fetch_response)
				.catch(function(err)
				{
					console.log('Fetch Error :-S', err);
				})
			)
	})
}

function fetch_response(response)
{
	console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
	if (response.status !== 200)
	{
		console.log('Looks like there was a problem. Status Code: ' +
		response.status);
	        // return;
	}

	// Examine the text in the response
	response.blob().then(function(data)
	{
		console.log(data);
	})
	var fr = new FileReader();
	fr.onload = function(data_url)
	{
		console.log(data_url.target.result);
	}
	fr.readAsDataURL(data); // async call

}
