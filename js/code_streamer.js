
///
///
function CreatePdf()
{
	console.log("CreatePdf");
	var file_data = document.getElementById("cover").files[0];
	var url = document.getElementById("url").value;
	console.log(file_data);
	var url_a = document.createElement('a');
	url_a.setAttribute('href', url);
	var hostname = url_a.hostname;

	if(hostname === "open.spotify.com")
	{
		var spotify_code_data;
		MakeSpotifyRequest(url, true)
			.then(function(code_data)
			{
				console.log("Loaded Spotify code");
				console.log(code_data);
				spotify_code_data = code_data;
				return MakeReadFileRequest(file_data);

			})
			.then(function(imageData)
			{
				console.log("Loaded cover image");
				GeneratePdf(imageData, spotify_code_data, true);
			});
	}
	else
	{
		var qr_code_data;
		var qr_div = document.createElement("div");
		var qrcode = new QRCode(qr_div);
		qrcode.makeCode(url);
		MakeQrCodeRequest(qr_div)
			.then(function(code_data)
			{
				console.log("Loaded QR code");
				qr_code_data = code_data;
				return MakeReadFileRequest(file_data);
			})
			.then(function(imageData)
			{
				console.log("Loaded cover image");
				GeneratePdf(imageData, qr_code_data, false);
			});
	}
}


function CreateDualPdf()
{
	console.log("CreateDualPdf");
	var file_data = [ document.getElementById("coverA").files[0], document.getElementById("coverB").files[0] ];
	var url = [document.getElementById("urlA").value, document.getElementById("urlB").value];
	console.log(file_data);
	var url_a = document.createElement('a');
	url_a.setAttribute('href', url[0]);
	var hostname = [url_a.hostname];
	url_a.setAttribute('href', url[1]);
	hostname.push(url_a.hostname);

	if(hostname[0] !== hostname[1])
	{
		return // ERROR
	}

	var dual_image_data = new Array();
	var dual_code_data = new Array();

	if(hostname[0] === "open.spotify.com")
	{
		var spotify_code_data;
		MakeSpotifyRequest(url[0], false)
			.then(function(code_data)
			{
				console.log("Loaded Spotify code");
				console.log(code_data);
				dual_code_data.push(code_data);
				return MakeReadFileRequest(file_data[0]);

			})
			.then(function(image_data)
			{
				dual_image_data.push(image_data);
				return MakeSpotifyRequest(url[1], false)
			})
			.then(function(code_data)
			{
				dual_code_data.push(code_data);
				return MakeReadFileRequest(file_data[1]);

			})
			.then(function(image_data)
			{
				console.log("Loaded cover image");
				dual_image_data.push(image_data);
				GenerateDualPdf(dual_image_data, dual_code_data, true);
			});
	}
	else
	{
		var qr_div = document.createElement("div");
		var qrcode = new QRCode(qr_div);
		qrcode.makeCode(url[0]);
		MakeQrCodeRequest(qr_div)
			.then(function(code_data)
			{
				console.log("Loaded QR code");
				dual_code_data.push(code_data);
				return MakeReadFileRequest(file_data[0]);
			})
			.then(function(image_data)
			{
				dual_image_data.push(image_data);
				qrcode.makeCode(url[1]);
				return MakeQrCodeRequest(qr_div);
			})
			.then(function(code_data)
			{
				dual_code_data.push(code_data);
				return MakeReadFileRequest(file_data[1]);
			})
			.then(function(image_data)
			{
				console.log("Loaded cover image");
				dual_image_data.push(image_data);
				GenerateDualPdf(dual_image_data, dual_code_data, false);
			});
	}
}


//
//
function MakeSpotifyRequest(url, rotate)
{
	return new Promise(function(resolve, reject)
	{
		fetchSpotify(resolve, reject, url, rotate);
	});
}

//
//
function MakeReadFileRequest(file_data)
{
	return new Promise(function(resolve, reject)
	{
		readFile(resolve, reject, file_data);
	});
}

//
//
function MakeQrCodeRequest(qr_div)
{
	return new Promise(function(resolve, reject)
	{
		fetchQrCode(resolve, reject, qr_div);
	});
}

///
///
function readFile(resolve, reject, file_data) {
	console.log("file " + file_data)

	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = function(event)
	{
		var imgData = event.target.result;
		var width = 0, height = 0;
		resolve(imgData)
	}; // (file);

	// Read in the image file as a data URL.
	reader.readAsDataURL(file_data);
}

///
///
function GeneratePdf(imgData, url_data, spotify)
{
	GetImageSize(imgData, function(width, height)
	{
		console.log("size " + width + "x" + height)
		var factor_x = width/Math.max(width,height);
		var factor_y = height/Math.max(width,height);
		console.log("factor " + factor_x + "x" + factor_y)
		var doc = new jsPDF("landscape", "mm", [150, 100]);
		var top_x = 75 - factor_x * 50;
		var top_y = 50 - factor_y * 50;
		x = factor_x * 100;
		y = factor_y * 100;
		doc.addImage(imgData, top_x, top_y, x, y);
		console.log("Add scan code");
		if(spotify===true)
		{
			doc.addImage(url_data, 0, 0, 25, 100);
		}
		else
		{
			doc.addImage(url_data, 2.5, 2.5, 21.5, 21.5);
		}
		doc.save('code-stream.pdf'); // TODO filename from cover image
	});
}


///
///
function GenerateDualPdf(img_data, url_data, spotify)
{
	GetImageSize(img_data[0], function(widthA, heightA)
	{
		
		GetImageSize(img_data[1], function(widthB, heightB)
		{
			var doc = new jsPDF("landscape", "mm", [150, 100]);
			var scale = ScaleDual(widthA, heightA, 73, 0);
			doc.addImage(img_data[0], scale[0]+1, scale[1]+1, scale[2], scale[3]);
			var scale = ScaleDual(widthB, heightB, 73, 27);
			doc.addImage(img_data[1], scale[0]+76, scale[1]-1, scale[2], scale[3]);

			console.log("Add scan code");
			if(spotify===true)
			{
				doc.addImage(url_data[0], 1, 73+2, 73, 73/4);
				doc.addImage(url_data[1], 76, 6.5, 73, 73/4);
			}
			else
			{
				doc.addImage(url_data[0], 3, 74 + 2, 20, 20);
				doc.addImage(url_data[1], 150-3-20 , 4, 20, 20);
			}
			doc.save('code-stream-dual.pdf'); // TODO filename from cover image
		});
	});
}

//
function ScaleDual(width, height, size, indent)
{
	var factor_x = width/Math.max(width,height);
	var factor_y = height/Math.max(width,height);
	x = factor_x * size;
	y = factor_y * size;

	var top_x = size/2 - factor_x * size/2;
	var top_y = size/2 + indent - factor_y * size/2;

	return [top_x, top_y, x, y];
}

///
///
function GetImageSize(image_data, callback)
{
	var img = new Image(); // document.createElement('img');

	img.onload = function() 
	{
		console.log("Image size loaded");
		var width = img.naturalWidth;
		var height = img.naturalHeight;
		callback(width, height);
	}
	img.src = image_data;
}

///
///
function fetchQrCode(resolve, reject, qr_div)
{
	setTimeout(function(){
		var qr_img = qr_div.lastElementChild;
		resolve(qr_img.src);
	}, 100);
}

///
///
function fetchSpotify(resolve, reject, url, rotate)
{
	var url_a = document.createElement('a');
	url_a.setAttribute('href', url);
	console.log(url_a.pathname);
	var spoty_path = url_a.pathname.split('/');
	var spoty_codes = [];
	for(num in spoty_path)
	{
		if(num == 0)
		{
			continue;
		}
		if ( num < spoty_path.length-1)
		{
			spoty_codes.push("spotify");
		}
		spoty_codes.push(spoty_path[num]);
		
	}

	var spoty_url = "https://scannables.scdn.co/uri/plain/png/ffffff/black/1000/" + spoty_codes.join(':');
	console.log("Spotify: " + spoty_url);
	var xhr = new XMLHttpRequest();
	xhr.open('get', spoty_url);
	xhr.responseType = 'blob';
	xhr.onload = function()
	{
		var img = new Image();

		img.onload = function()
		{ 
			var canvas = document.createElement('canvas');
			var canvas_context = canvas.getContext('2d');
			if(rotate === true)
			{
				canvas.height = img.naturalWidth; // or 'width' if you want a special/scaled size
				canvas.width = img.naturalHeight; // or 'height' if you want a special/scaled size
	        		canvas_context.rotate(-90 * Math.PI / 180);
		                canvas_context.translate(-canvas.height, 0);
			}
			else
			{
				canvas.width = img.naturalWidth; // or 'width' if you want a special/scaled size
				canvas.height = img.naturalHeight; // or 'height' if you want a special/scaled size
		                // canvas_context.translate(-canvas.width, 0);
			}

			canvas_context.drawImage(img, 0, 0);

			// ... or get as Data URI
			var code_data = canvas.toDataURL();
			resolve(code_data);
		};
		img.src = URL.createObjectURL(xhr.response);
	};
	xhr.send();
}


function toggleDisplay(id) {
	var element = document.getElementById(id);

	// If the checkbox is checked, display the output text
	if (element.style.display === "none")
	{
		element.style.display = "block";
	} else {
		element.style.display = "none";
	}
}




