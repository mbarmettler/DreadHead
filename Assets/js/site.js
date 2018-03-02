////////////////////////////////////////////////////
// main Jquery scripts for DreadUrHead App
// developped by Mike Barmettler 2017/2018
////////////////////////////////////////////////////

//specify Dread Hair images on web folder /img/dreads/
var dreadSelectionArray = ["Dreads(1).png", "Dreads(2).png", "Dreads(3).png", "Dreads(4).png", "Dreads(5).png", "Dreads(6).png", "Dreads(7).png", "Dreads(8).png", "Dreads(9).png", "Dreads(10).png", "Dreads(11).png", "Dreads(12).png", "Dreads(13).png", "Dreads(14).png", "Dreads(15).png", "Dreads(16).png", "Dreads(17).png", "Dreads(18).png", "Dreads(19).png", "Dreads(20).png","Dreads(21).png", "Dreads(22).png", "Dreads(23).png"];
//Path on FTP to the orginal Dreard photos
var ftpPathToOrginalDreads = "Assets/img/dreads/";
var ftpPathToThumbDreads = "Assets/img/dreads/thumbs/";

//global variables for image editing/sizing/transform
var orginalPortraitWidth = 0;
var scaleddownMaxPortraitwidth = 0;
var portraitexiforientation = -1;
var portraitRotationDegree = 0;
var currentPortraitScale = 1.0;

//
//Main function
//
$(function () {		

        //init DreadSelectionList
		initializeDreadSelectionList(dreadSelectionArray);		

        //User portrait image changed / selected
        $("input:file").change(function () {
        
             // Let's store the FileList Array into a variable:
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            var files  = this.files;
            // Let's create an empty `errors` String to collect eventual errors into:
            var errors = "";

            portraitRotationDegree = 0;
    
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
                        // reset exifInformation
                        portraitexiforientation = -1;
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
           
        $("#zoomplus").on("click", function(e){
			var newValue = currentPortraitScale + 0.15;
            var n = $('#userPortrait');
            var oldwidth = parseFloat(n.css("width"));            
            var newWidth = oldwidth*newValue + "px";
            $('#userPortrait').css("width", newWidth);
            $('#userPortrait').css("top", "0px");
		});

		$("#zoomminus").on("click", function(e){
			var newValue = currentPortraitScale - 0.15;
            var n = $('#userPortrait');
            var oldwidth = parseFloat(n.css("width"));
            var newWidth = oldwidth*newValue + "px";
            $('#userPortrait').css("width", newWidth);
            $('#userPortrait').css("top", "0px");
        });

        $(".btn-circle-up").on("click",function(){
            var n = $("#userPortrait");           
            n.css('top', (parseFloat(n.css('top')) - 10) + 'px');
        });

        $(".btn-circle-down").on("click",function(){            
            var n = $("#userPortrait");           
            n.css('top', (parseFloat(n.css('top')) + 10) + 'px');
        });

        $(".btn-circle-left").on("click",function(){            
            var n = $("#userPortrait");           
            n.css('right', (parseFloat(n.css('right')) + 10) + 'px');
        });

        $(".btn-circle-right").on("click",function(){            
            var n = $("#userPortrait");           
            n.css('right', (parseFloat(n.css('right')) - 10) + 'px');
        });

        //generate image with watermark & download image locally
        $("#genBtn").on("click", function(e) {
            e.preventDefault();  //stop the browser from following

            //start loading indicator on button
            var $genBtn = $("#genBtn");
            $genBtn.button('loading');

            generateImage();	
            var canvassource = $("canvas").getCanvasImage('png');          

            var save = document.createElement('a');
            save.href = canvassource;
            save.download = 'myDreadHead.png';
            //hidden link for download png
            save.style = 'display:none;opacity:0;color:transparent;';
            (document.body || document.documentElement).appendChild(save);

            if (typeof save.click === 'function') {
                save.click();
            } else {
                save.target = '_blank';
                var event = document.createEvent('Event');
                event.initEvent('click', true, true);
                save.dispatchEvent(event);
            }

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
            $genBtn.button('reset');
        });        

        // //selecting dreads and add to cropping area
		$(".thumbnail").on("click",function(){	
			if(!$(this).hasClass('active'))
			{ 		
				$(".thumbnail").removeClass("active");
				$(this).addClass("active");
			}
			
             $(".ui-wrapper img").remove();             

			//prepare dread img from selectionlist (thumbs)
			//create new img with orginal Dread photo
            var thumbdreadImgsrc = $(this).find('img').attr("src");
            var dreadPathArray = thumbdreadImgsrc.split('/'); 
            var filename = dreadPathArray[dreadPathArray.length-1];

            var orginalDreadImgSrc = ftpPathToOrginalDreads + filename;

            var img = $('<img />', { 
                id: 'userDreads',
                src: orginalDreadImgSrc,
                alt: 'dreadcanvas'
              });                       

            var loadingHtmlstring = "<div id='loading'><p><img src='Assets/img/busy.gif'/> Please Wait</p></div>";

            //important - wait for the image is loaded
            img.on('load', function(){       
                img.prependTo($('#croppingArea'));
                $(".ui-wrapper").append(loadingHtmlstring);

                var ratio = 0; 
                var width = $("#userDreads").width();    // Current image width
                var height = $("#userDreads").height();  // Current image height
                var maxWidth = $("#croppingArea").width();
                var maxHeight = $("#croppingArea").height();

                if(height > maxHeight){
                    ratio = maxHeight / height; // get ratio for scaling image
                    $("#userDreads").css("height", maxHeight);   // Set new height
                    width = width * ratio;    // Reset width to match scaled image    
                    $("#userDreads").css("width", width);    // Scale width based on ratio
                }
                //Check if the current width is larger than the max
                // if(width > maxWidth){
                //     ratio = maxWidth / width;   // get ratio for scaling image
                //     $("#userDreads").css("width", maxWidth); // Set new width
                //     height = height * ratio;    // Reset height to match scaled image
                //     $("#userDreads").css("height", height);  // Scale height based on ratio   
                // }			

                //rotatable Options - defines angle of rotation
                var options = {
                    rotationCenterOffset: {
                          top: 0,
                          left: 0
                      }
                  };
            
                  //adding img editing options				
                  $("#userDreads").resizable({ handles: "ne" });            
                  $("#userDreads").parent().rotatable(options);
                  $("#userDreads").parent().css("z-index", 1);
                  $("#userDreads").parent().draggable({ appendTo: '#croppingArea', scroll:true });		
      
                  //place rotatable icon on top left
                  $(".ui-rotatable-handle").prependTo(".ui-wrapper");
      
                  //enable functional buttons
                  $('.btn').removeClass("disabled");	
              });

              $("#loading").remove();;
		});		
        
        // end document ready
    });
//


function downloadImage(link, canvasId, filename){
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

//File selection dialog with Filereader and exception handling
var useBlob = false && window.URL;
function readImage (file) {

	// Create a new FileReader instance
	// https://developer.mozilla.org/en/docs/Web/API/FileReader
	var reader = new FileReader();

    //check image exif metadate (mobile photos)
    //affects initial rotation
    preRotateImage(file);

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

            //remove old images
            // $("#croppingArea").empty();       

            //exif metadata rotation applying
            switch (portraitexiforientation) {
                case -1:
                portraitRotationDegree = 0;
                    break;
                case 1:
                portraitRotationDegree = 0;
                    break;
                case 2:
                portraitRotationDegree = 0;
                    break;
                case 3:
                portraitRotationDegree = 180;
                    break;
                case 4:
                portraitRotationDegree = 180;
                    break;
                case 5:
                portraitRotationDegree = 90;
                    break;
                case 6:
                portraitRotationDegree = 90;
                    break;
                case 7:
                portraitRotationDegree = 270;
                    break;
                case 8:
                portraitRotationDegree = 270;
                    break;
            }

            $(this).prop("id", "userPortrait");	        
            
            $(".croppingArea").empty();

			// Finally append our created image 
            $("#croppingArea").append(this);

            //activate zoom buttons
            $(".portraitZoomer").css("display", "inline-block");

			var portraitwidth = $("#userPortrait").width();
            var portraitheight = $("#userPortrait").height();
            
            if(portraitexiforientation > 4) {
                $(this).css('transform', 'rotate('+ portraitRotationDegree +'deg)')
                //switch height and width after rotated
                //todo - do this in switch case degree
                portraitwidth = $("#userPortrait").height();
                
                //reset width / height
                $("#userPortrait").width(portraitwidth);
             }


			//adding resizing and dragging
			$("#userPortrait").draggable({ appendTo:"#croppingArea" })

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

function initializeDreadSelectionList(dreadSelectionArray) {
    $.each(dreadSelectionArray, function (index, item) {
        $("#dreadSelectionList").append(
            '<div class="col-lg-4 col-sm-6 col-xs-6"><a href="#" class="thumbnail"><img class="img-thumbnail img-responsive" src="'
        + ftpPathToThumbDreads + item + '"/></a></div>');
        
        // console.log(item);
    });
}

//generates Result Image (JCanvas)
function generateImage()
{    
    var ratioDread = 0;    
    var ratioPortrait = 0;
    var portraitAngle = 0;
    var dreadAngle = 0;

    var potraitWidth = $("#userPortrait").width()*currentPortraitScale;
    var potraitHeight = $("#userPortrait").height()*currentPortraitScale;

    console.log("=====portrait dim=======")
    console.log(potraitWidth);
    console.log(potraitHeight);

    var dread = $("#userDreads").attr("src");
    var portrait = $("#userPortrait").attr('src');

    var dreadwidth = $("#userDreads").width();
    var dreadHeight = $("#userDreads").height();

    $("#canvas").attr("width", potraitWidth);

    dreadAngle = getCurrentRotationFixed("userDreads", true);
    portraitAngle = getCurrentRotationFixed("userPortrait", false); 

    //Forces it to be parsed as a decimal number, otherwise strings beginning with '0' might be parsed as an octal number 
    //(might depend on the browser used)
    var dreadLeftPos = parseInt($("#userDreads").parent(".ui-wrapper").css("left"), 10);
    var dreadTopPos = parseInt($('#userDreads').parent(".ui-wrapper").css('top'), 10);

    var portraitLeftPos = parseInt($("#userPortrait").css("left"), 10);
    var portraitTopPos = parseInt($('#userPortrait').css('top'), 10);
        
    console.log("=====dreadpos l-t =======")
    console.log(dreadLeftPos);
    console.log(dreadTopPos);
    console.log("======potrtraitpos l-t ======")
    console.log(portraitLeftPos);
    console.log(portraitTopPos);    

    //clear canvas before rendering
    $("#canvas").clearCanvas();

    $("#canvas")
        .drawImage({
            source: portrait,	
            x: 20,
            y: 40,
            width: potraitWidth,
            height: potraitHeight,
            index: 0,
            rotate: portraitAngle,
            fromCenter: false
        })
        .drawImage({
            source: dread,
            x: dreadLeftPos-40,
            y: dreadTopPos+40,					
            width: dreadwidth,
            height: dreadHeight,
            rotate: dreadAngle,            
            index: 2, 
            fromCenter: false
        })
        .drawImage({
            source: "http://dreadlocks-artesanal.ch/dreadhead/Assets/img/corp/logo.png",
            x: 20,
            y: 20,
            width: 90,
            height: 90,
            index: 1, 
            fromCenter: false
        })
        .drawText({
            font: '13pt sans-serif',
            fillStyle: '#333333',
            strokeStyle: '#75a62b',
            x: 20,	
            y: 560,
            align: 'left',
            strokeWidth: 1,
            text: "dreadlocks-artesenal.ch",            
            index: 1, 
            fromCenter: false
        }).restoreCanvas();           
}

//Exif Metadata handling
function preRotateImage(file)
{    
  var binfR = new FileReader();

  binfR.addEventListener("load", function () {
    
    var view = new DataView(binfR.result);
    
    if (view.getUint16(0, false) != 0xFFD8)
    {
        portraitexiforientation = -2;
    } 
    var length = view.byteLength, offset = 2;
    while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) 
        {
            portraitexiforientation = -1;
        }
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
            {
                portraitexiforientation = view.getUint16(offset + (i * 12) + 8, little);
            }
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
    }
  });
  
  binfR.readAsArrayBuffer(file);  
}

//calculates Degree value of Rotation Transformation Matrix (css helper)
function getCurrentRotationFixed(elid, searchOnParent) 
{
    var el;
    var st;
    var tr;
    if(searchOnParent)    {
        el = document.getElementById(elid).parentNode;
        st = window.getComputedStyle(el, null);        
        tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "fail...";
    }
    else  {
        el = document.getElementById(elid);
        st = window.getComputedStyle(el, null);
        tr = st.getPropertyValue("-webkit-transform") ||
         st.getPropertyValue("-moz-transform") ||
         st.getPropertyValue("-ms-transform") ||
         st.getPropertyValue("-o-transform") ||
         st.getPropertyValue("transform") ||
         "fail...";
    }

    if( tr !== "none") {
      //console.log('Matrix: ' + tr);
  
      var values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
      var a = values[0];
      var b = values[1];
      var c = values[2];
      var d = values[3];
  
      var scale = Math.sqrt(a*a + b*b);
  
      // First option, don't check for negative result
      // Second, check for the negative result
      /** /
      var radians = Math.atan2(b, a);
      var angle = Math.round( radians * (180/Math.PI));
      /*/
      var radians = Math.atan2(b, a);
      if ( radians < 0 ) {
        radians += (2 * Math.PI);
      }
      var angle = Math.round( radians * (180/Math.PI));
      /**/
      
    } 
    else   {
      var angle = 0;
    }
  
    // works!
    //console.log('Rotate: ' + angle + 'deg');
    return angle;   
  }