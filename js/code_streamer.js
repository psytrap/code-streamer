
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
		fetchSpotify(url, file_data);
	}
	else
	{
		var qr_div = document.createElement("div");
		var qrcode = new QRCode(qr_div);
		qrcode.makeCode(url);
		setTimeout(function(){ fetchQrCode(qr_div, file_data); }, 100);
	}
}

///
///
function readFile(file_data, url_data, spotify) {
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
			if(spotify===true)
			{
				doc.addImage(url_data, 0, 0, 25, 100);
			}
			else
			{
				doc.addImage(url_data, 2, 2, 21, 21);
			}
			doc.save('Test_jspdf_Create.pdf');
		});

	}; // (file);

	// Read in the image file as a data URL.
	reader.readAsDataURL(file_data);
}

///
///
function GetImageSize(image_data, callback)
{
	var img = new Image(); // document.createElement('img');

	img.onload = function() 
	{
		var width = img.naturalWidth;
		var height = img.naturalHeight;
		callback(width, height);

	}
	img.src = image_data;
}

///
///
function fetchQrCode(qr_div, file_data)
{
	var qr_img = qr_div.lastElementChild;
	var url_data = qr_img.src;

	readFile(file_data, url_data);
}

///
///
function fetchSpotify(url, file_data)
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
			var data = canvas.toDataURL();
			readFile(file_data, data, true);
		};
		img.src = URL.createObjectURL(xhr.response);
	};
	xhr.send();
}

