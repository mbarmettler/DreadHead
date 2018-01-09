////////////////////////////////////////////////////
// main Jquery scripts for DreadUrHead App
// developped by Mike Barmettler 2017/2018
////////////////////////////////////////////////////

//specify Dread Hair images on web folder /img/dreads/
var dreadSelectionArray = ["Dreads (1).png", "Dreads (2).png", "Dreads (3).png", "Dreads (4).png", "Dreads (5).png", "Dreads (6).png", "Dreads (7).png", "Dreads (8).png", "Dreads (9).png", "Dreads (10).png", "Dreads (11).png", "Dreads (12).png", "Dreads (13).png", "Dreads (14).png", "Dreads (15).png", "Dreads (16).png", "Dreads (17).png"];

//global variables for image editing/sizing/transform
var orginalPortraitWidth = 0;
var scaleddownMaxPortraitwidth = 0;
var portraitexiforientation = -1;
var initialresizeportrait = false;
var rotationDegree = 0;
var currentPortraitScale = 1.0;

//
//Main function
//
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
    
        //initialize DreadSelectionList
        initializeDreadSelectionList(dreadSelectionArray);
        
        $("#zoomplus").on("click", function(e){
			var newValue = currentPortraitScale + 0.15;
			$('#userPortrait').css({
			'-webkit-transform' : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-moz-transform'    : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-ms-transform'     : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-o-transform'      : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'transform'         : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)'
			});
			currentPortraitScale = newValue;
		});

		$("#zoomminus").on("click", function(e){
			var newValue = currentPortraitScale - 0.15;
			$('#userPortrait').css({
			'-webkit-transform' : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-moz-transform'    : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-ms-transform'     : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)',
			'-o-transform'      : 'scale(' + newValue + ')  rotate('+ rotationDegree +'deg)',
			'transform'         : 'scale(' + newValue + ') rotate('+ rotationDegree +'deg)'
			});
			currentPortraitScale = newValue;
        });
        
        //selecting dreads and add to cropping area
		$(".thumbnail").on("click", function(){	
			if(!$(this).hasClass('active'))
			{ 		
				$(".thumbnail").removeClass("active");
				$(this).addClass("active");
			}
			
		 	$(".ui-wrapper img").remove();
	
			//prepare dread img from selectionlist
			//replace thumbnail with original img
			var dreadImgsrc = $(this).find('img').clone();
			var orginalDreadImgSrc = dreadImgsrc.attr("src").replace("thumbs/","");
			dreadImgsrc.attr("src", orginalDreadImgSrc);

			dreadImgsrc.removeClass();
			dreadImgsrc.prop("id", "userDreads");	

			//add new dread selection           			
            dreadImgsrc.prependTo("#croppingArea");
			
			var options = {
			  rotationCenterOffset: {
					top: 0,
					left: 0
				}
			};
						
			//adding img editing options				
			dreadImgsrc.resizable({ handles: "ne" });

  			dreadImgsrc.parent().rotatable(options);
			dreadImgsrc.parent().css("z-index", 1);
			dreadImgsrc.parent().draggable({ appendTo: '#cropping-area', scroll:true });		

			//place rotatable icon on top left
			$(".ui-rotatable-handle").prependTo(".ui-wrapper");

			//enable functional buttons
			$('.btn').removeClass("disabled");		
		});		
        
        // end document ready
    });
//

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

            var croppingWidth = $("#croppingArea").width();

            //remove old images
            $("#croppingArea").empty();       

            //exif metadata rotation applying
            switch (portraitexiforientation) {
                case 1:
                rotationDegree = 0;
                    break;
                case 2:
                rotationDegree = 0;
                    break;
                case 3:
                rotationDegree = 180;
                    break;
                case 4:
                rotationDegree = 180;
                    break;
                case 5:
                rotationDegree = 90;
                    break;
                case 6:
                rotationDegree = 90;
                    break;
                case 7:
                rotationDegree = 270;
                    break;
                case 8:
                rotationDegree = 270;
                    break;
            }

            $(this).prop("id", "userPortrait");	        
                            
			// Finally append our created image and the HTML info string to our `#preview` 
			$("#croppingArea").append(this);		

            //activate zoom buttons
            $("#zoomplus").css("display", "inline-block");      
            $("#zoomminus").css("display", "inline-block");       
			var portraitwidth = $("#userPortrait").width();
            var portraitheight = $("#userPortrait").height();
            
            if(rotationDegree > 0) {
                $(this).css('transform', 'rotate('+ rotationDegree +'deg)')
                //switch height and width after rotated
                portraitwidth = $("#userPortrait").height();
                portraitheight = $("#userPortrait").width();
             }

            //append portrait slider
            $(".slider").css("display", "block");      

            if(initialresizeportrait){
                var portraitwidth = $(this).width();
                var portraitheight = $(this).height();
                var croppingWidth = $("#croppingArea").width();

                orginalPortraitWidth = portraitwidth;

                if (portraitwidth >= croppingWidth)
                {        
                    // var ratioPortrait = 0;

                    // if(portraitwidth > portraitheight) {
                    //     ratioPortrait =  portraitwidth / portraitheight;
                    // }
                    // else{
                    //     ratioPortrait = portraitheight / portraitwidth;
                    // }

                    scaleddownMaxPortraitwidth = croppingWidth/100*80;
                    $(this).width(scaleddownMaxPortraitwidth);
                }
            }
			//adding resizing and dragging
			$("#userPortrait").draggable({ appendTo:"#cropping-area" })

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
    dreadSelectionArray.forEach(function (item, index, array) {
        $("#dreadSelectionList").append('<div class="col-lg-4 col-sm-4 co-xs-12"><a href="#" class="thumbnail"><img class="img-thumbnail img-responsive" src="Assets/img/dreads/thumbs/' + item + '"/></a></div>');
    });
}

//generates Result Image (JCanvas)
function generateImage()
{    
    var dread = $("#userDreads").attr("src");
    var portrait = $("#userPortrait").attr('src');

    var userDreadAngle = getCurrentRotationFixed("userDreads", true);
    var portraitAngle = getCurrentRotationFixed("userPortrait", false);
        
    //Forces it to be parsed as a decimal number, otherwise strings beginning with '0' might be parsed as an octal number 
    //(might depend on the browser used)
    var dreadLeftPos = parseInt($("#userDreads").parent(".ui-wrapper").css("left"), 10);
    var dreadTopPos = parseInt($('#userDreads').parent(".ui-wrapper").css('top'), 10);

    var dreadwidth = $("#userDreads").width();
    var dreadHeight = $("#userDreads").height();

    var ratioDread = 0;    
    var ratioPortrait = 0;

    var potraitWidth = 0;
    var potraitHeight = 0;

    //portrait is prerotated by App
    if(portraitAngle > 0){        
        if($("#userPortrait").width() > $("#userPortrait").height()){
            potraitWidth =  $("#userPortrait").width()*currentPortraitScale;;
            potraitHeight =  $("#userPortrait").height()*currentPortraitScale;;
            ratioPortrait =  potraitWidth / potraitHeight;
        }
        else{
            potraitWidth = $("#userPortrait").height();
            potraitHeight = $("#userPortrait").width();
            ratioPortrait = potraitHeight / potraitWidth;
        }
    }
    else{
        potraitWidth =  $("#userPortrait").width()*currentPortraitScale;
        potraitHeight =  $("#userPortrait").height()*currentPortraitScale;
    }

   
    if($("#userDreads").width() > $("#userDreads").height())
    {
        ratioDread =  dreadwidth / dreadHeight;
    }
    if($("#userDreads").height() > $("#userDreads").width())
    {
        ratioDread = dreadHeight / dreadwidth;
    }

    //clear canvas before rendering
    $("#canvas").clearCanvas();

    $("#canvas")
        .drawImage({
            source: portrait,	
            x: 250,
            y: 250,
            width: potraitWidth,
            height: potraitHeight,
            index: 0,
            rotate: portraitAngle
        })
        .drawImage({
            source: dread,
            x: (dreadwidth/ratioDread),
            y: (dreadHeight/ratioDread),					
            width: dreadwidth,
            height: dreadHeight,
            rotate: userDreadAngle
        })
        .drawImage({
            source: "http://dreadlocks-artesanal.ch/dreadhead/Assets/img/corp/logo.png",
            x: 50,
            y: 50,
            width: 90,
            height: 90
        })
        .drawText({
            font: '13pt sans-serif',
            fillStyle: '#333333',
            strokeStyle: '#75a62b',
            x: 90,	
            y: 550,
            align: 'left',
            strokeWidth: 1,
            text: "dreadlocks-artesenal.ch"
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
function getCurrentRotationFixed( elid, searchOnParent) 
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