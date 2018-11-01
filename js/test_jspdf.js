
// create pdf of 10x15cm




function Test_jspdf_Create()
{
	console.log("Test_jspdf_Create");
	var doc = new jsPDF("landscape", "mm", [150, 100]);
	doc.save('Test_jspdf_Create.pdf');
}
