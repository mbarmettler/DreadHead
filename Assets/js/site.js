////////////////////////////////////////////////////
// main Jquery scripts for DreadUrHead App
// developped by Mike Barmettler 2017/2018
////////////////////////////////////////////////////

//specify Dread Hair images on web folder /img/dreads/
var dreadSelectionArray = ["1.png","2.png","3.png","4.png", "5.png", "6.gif", "7.png", "8.png"];

var orginalPortraitWidth = 0;

//File selection dialog with Filereader and exception handling
var useBlob = false && window.URL;
function readImage (file) {

	// Create a new FileReader instance
	// https://developer.mozilla.org/en/docs/Web/API/FileReader
	var reader = new FileReader();

	// Once a file is successfully readed:
	reader.addEventListener("load", function () {

		// At this point `reader.result` contains already the Base64 Data-URL
		// and we've could immediately show an image using
		// `elPreview.insertAdjacentHTML("beforeend", "<img src='"+ reader.result +"'>");`
		// But we want to get that image's width and height px values!
		// Since the File Object does not hold the size of an image
		// we need to create a new image and assign it's src, so when
		// the image is loaded we can calculate it's width and height:
		var image  = new Image();
		image.crossOrigin = "anonymous";
		image.addEventListener("load", function () {
            //remove old portrait
            $("#userPortrait").remove();
                
			// Finally append our created image and the HTML info string to our `#preview` 
			$("#croppingArea").append(this);		

            //append portrait slider
            $(".slider").css("display", "block");

            //find userportrait and set ID
			var userportrait = $("#croppingArea").find("img[crossorigin='anonymous']");
			userportrait.prop("id", "userPortrait");	
                        
			var portraitwidth = userportrait.width();
            var portraitheight = userportrait.height();
            var croppingWidth = $("#croppingArea").width();

            orginalPortraitWidth = portraitwidth;

            if (portraitwidth > croppingWidth)
            {
                userportrait.width(croppingWidth);
                orginalPortraitWidth = croppingWidth;

                $("#imgZoomslider").bootstrapSlider("setValue",100);
            }

			//adding resizing and dragging
			//$("#userPortrait").draggable({ width: portraitwidth, height: portraitheight, appendTo:"#cropping-area", scroll: false })

			// If we set the variable `useBlob` to true:
			// (Data-URLs can end up being really large
			// `src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA...........etc`
			// Blobs are usually faster and the image src will hold a shorter blob name
			// src="blob:http%3A//example.com/2a303acf-c34c-4d0a-85d4-2136eef7d723"
			if (useBlob) {
				// Free some memory for optimal performance
				window.URL.revokeObjectURL(image.src);
			}
		});
			
		image.src = useBlob ? window.URL.createObjectURL(file) : reader.result;
  });
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  reader.readAsDataURL(file);  
}

$(function () {		

    //User portrait image changed / selected
    $("input:file").change(function () {
    
         // Let's store the FileList Array into a variable:
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        var files  = this.files;
        // Let's create an empty `errors` String to collect eventual errors into:
        var errors = "";

        if (!files) {
            errors += "File upload not supported by your browser.";
        }

        // Check for `files` (FileList) support and if contains at least one file:
        if (files && files[0]) {

            // Iterate over every File object in the FileList array
            for(var i=0; i<files.length; i++) {

                // Let's refer to the current File as a `file` variable
                // https://developer.mozilla.org/en-US/docs/Web/API/File
                var file = files[i];

                // Test the `file.name` for a valid image extension:
                // (pipe `|` delimit more image extensions)
                // The regex can also be expressed like: /\.(png|jpe?g|gif)$/i
                if ( (/\.(png|jpeg|jpg|gif)$/i).test(file.name) ) {
                    // SUCCESS! It's an image!
                    // Send our image `file` to our `readImage` function!
                    readImage( file ); 
                }
                else {
                errors += file.name +" Unsupported Image extension\n";  
                }
            }
        }

        // Notify the user for any errors (i.e: try uploading a .txt file)
        if (errors) {
            alert(errors); 
        }
    });

    //initialize DreadSelectionList
    initializeDreadSelectionList(dreadSelectionArray);
    
    // end document ready
});

function initializeDreadSelectionList(dreadSelectionArray) {
    dreadSelectionArray.forEach(function (item, index, array) {
        $("#dreadSelectionList").append('<a href="#" class="thumbnail"><img class="img-thumbnail" src="Assets/img/dreads/' + item + '"/></a>');
    });
}

function generateImage()
{    
    var dread = $("#userDreads").attr("src");
    var portrait = $("#userPortrait").attr('src');

    var dreadParent = $("#userDreads").parent();
    var dreadParentTransform = dreadParent.css("transform");
    $("#userDreads").css("transform:", dreadParentTransform);
//todo x and y of dreads
    // $("#userDreads").css("top:", dreadParent.css("top"));


    var dreadwidth = $("#userDreads").width();
    var dreadHeight = $("#userDreads").height();

    var potraitWidth =  $("#userPortrait").width();
    var potraitHeight =  $("#userPortrait").height();

    // var ratioDread = 0;
    // if($("#userDreads").width() > $("#userDreads").height())
    // {
    //     ratioDread =  dreadwidth / dreadHeight;
    // }
    // if($("#userDreads").height() > $("#userDreads").width())
    // {
    //     ratioDread = potraitHeight / potraitWidth;
    // }

    var ratioPortrait = 0;
    if($("#userPortrait").width() > $("#userPortrait").height())
    {
        ratioPortrait =  dreadwidth / dreadHeight;
    }
    if($("#userPortrait").height() > $("#userPortrait").width())
    {
        ratioPortrait = potraitHeight / potraitWidth;

    }


    //clear canvas before rendering
    $("#canvas").clearCanvas();
    
    $("#canvas").drawImage({
            source: "http://dreadlocks-artesanal.ch/dreadhead/Assets/img/corp/logo.png",
            x: 50, y: 50,
            width: "90",
            height: "90"
            })
        .drawText({
            font: '13pt sans-serif',
            fillStyle: '#333333',
            strokeStyle: '#75a62b',
            x: 100,	
            y: dreadHeight+150,
            align: 'left',
            strokeWidth: 1,
            text: "dreadlocks-artesenal.ch"
        })
        .drawImage({
            source: portrait,	
            x: potraitWidth-120,
            y: potraitHeight*ratioPortrait,
            width: potraitWidth,
            height: potraitHeight
        })
        .drawImage({
            source: dread,
            x: potraitWidth*ratioPortrait,
            y: potraitHeight,					
            width: dreadwidth,
            height: dreadHeight
        });   

    $('#canvas').getCanvasImage('png');
    $('#canvas').getCanvasImage('jpeg', 1);
    //top.location.href = $('#canvas').getCanvasImage('png');
}