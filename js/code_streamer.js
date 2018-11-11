
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
		MakeSpotifyRequest(url)
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

//
//
function MakeSpotifyRequest(url)
{
	return new Promise(function(resolve, reject)
	{
		fetchSpotify(resolve, reject, url);
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
		top_x = 75 - factor_x * 50;
		top_y = 50 - factor_y * 50;
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
			doc.addImage(url_data, 2, 2, 21, 21);
		}
		doc.save('code-stream.pdf'); // TODO filename from cover image
	});
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
function fetchSpotify(resolve, reject, url, file_data)
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
			canvas.height = img.naturalWidth; // or 'width' if you want a special/scaled size
			canvas.width = img.naturalHeight; // or 'height' if you want a special/scaled size
			var canvas_context = canvas.getContext('2d');

        		canvas_context.rotate(-90 * Math.PI / 180);
	                canvas_context.translate(-canvas.height, 0);
			canvas_context.drawImage(img, 0, 0);

			// ... or get as Data URI
			var code_data = canvas.toDataURL();
			resolve(code_data);
		};
		img.src = URL.createObjectURL(xhr.response);
	};
	xhr.send();
}

