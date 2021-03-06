/*
	VizNov.js v0.1.1
	Released 12/16/2013
	https://github.com/ryanmurakami/VizNov.js
	@ryanmurakami

	See Github for license
*/

var VizNov = function(options) {

	window.game = this;
	this.theme = options.theme;

	/**
	 * fileName takes a full path and returns just the filename.
	 *
	 * @param file a full url path
	 * @return just the name of the file
	 */
	this.fileName = function(file) {
		if(!file) return '';
		var stringArr = file.split("/");
		return stringArr[stringArr.length - 1];
	}
};

VizNov.prototype.play = function() {
	if(!this.start) console.log("No starting scene.");
	else {
		this.start.play();
	}
};

VizNov.prototype.stop = function() {
	$('body').empty();
	game.track.pause();
	game = null;
};

VizNov.prototype.changeMusic = function(newSong, hard) {
	hard ? game.track.pause() : $(game.track).animate({volume: 0}, 1000);
	this.playSong(newSong, true);
};

VizNov.prototype.changeBackground = function(newBackground) {
	this.showBackground(newBackground);
};

VizNov.prototype.hideCharacter = function() {
	$('#character').remove();
};

VizNov.prototype.Scene = function(options) {
		if(options) {
			this.background = options.background;
			this.inTrans = options.inTrans;
			this.outTrans = options.outTrans;
			this.music = options.music;
		}
};

VizNov.prototype.Scene.prototype.play = function() {
	if(game.track) {
		if(game.fileName(game.track.src) !== game.fileName(this.music)) {
			$(game.track).animate({volume: 0}, 1000);
			if(this.music)game.playSong(this.music, true);
		}
	} else if(this.music) {
		game.playSong(this.music, true);
	}
	$('#stuff').empty();
	game.curScene = this;
	game.showBackground(this.background);
	var toPlay = this.mainPath;
	game.transition(this.inTrans, function() {
		toPlay.play();
	});
};

VizNov.prototype.Scene.prototype.setMain = function(path) {
	this.mainPath = path;
	return this.mainPath;
};

VizNov.prototype.Scene.prototype.Path = function(options) {
	this.text = options;
	this.lines = [];
	this.curLine = 0;
	this.line = function(line) {
		this.lines.push(line);
	};
};

VizNov.prototype.Scene.prototype.Path.prototype.loadLines = function(lines) {
	var parent = this;
	$.each(lines, function() {
		parent.line(this);
	});
};

VizNov.prototype.Scene.prototype.Path.prototype.exit = function(scene) {
	this.nextScene = scene;
	return this;
};

VizNov.prototype.Scene.prototype.Path.prototype.playLine = function(index) {
	//line props: say, think, sound, from, after, before, choice
	var line = this.lines[index];
	var prevLine = this.lines[index - 1];
	//out of lines
	if(!line) {
		var toPlay = this.nextScene;
		game.transition(game.curScene.outTrans, function() {
			if (toPlay) toPlay.play();
			else game.stop();
		});
	} else {
		if (line.before) line.before();
		if (line.choice) game.showChoices(line.choice.paths, 'bottom');
		//nothing to say
		else if (!line.say && !line.think && !line.sound) game.curPath.nextLine();
		//lots to say
		else {
			//show a character if needed
			if(line.from) {
				if(!prevLine || line.from !== prevLine.from)
					game.showCharacter(line.from.image, line.placement ? line.placement : line.from.placement, line.style);
			}
			var toSay;
			var decoration;
			if (line.say) toSay = line.from ? '[' + line.from.name + ']: "' + line.say + '"' :
				'"' + line.say + '"';
			else if (line.think) toSay = line.think;
			else if (line.sound) {
				toSay = line.sound;
				decoration = 'italic';
			}
			game.drawBox(
				window.innerWidth * 0.025, 	//x
				window.innerHeight * 0.70,	//y
				window.innerWidth * 0.95,	//width
				window.innerHeight * 0.25,	//height
				20,							//borderRadius
				"speechBox",				//id
				null,
				window.game.theme,
				function(ev) {
					var stuff = $(ev.target).closest('svg');
					var toRemove = stuff.next('div');
					toRemove.remove();
					game.curPath.nextLine();
				});

			game.textBox(
				window.innerWidth * 0.025 + 30,
				window.innerHeight * 0.7 + 30,
				null,
				window.innerHeight * 0.25 - 60,
				toSay,
				decoration,
				'text' + this.curLine,
				null,
				true,
				function(ev) {
					$(ev.target).remove();
					game.curPath.nextLine();
				});
		}
		if(line.after) line.after();
	}
};

VizNov.prototype.Scene.prototype.Path.prototype.nextLine = function() {
	this.curLine++;
	this.playLine(this.curLine);
};

VizNov.prototype.Scene.prototype.Path.prototype.chosen = function(choice) {
	$('.choice').remove();
	var rightPath;
	$.each(this.lines[this.curLine].choice.paths, function() {
		if(this.text === choice) 
		{
			rightPath = this;
			return false;
		}	
	});
	rightPath.play();
};

VizNov.prototype.Scene.prototype.Path.prototype.play = function(){
	game.curPath = this;
	this.playLine(this.curLine);
};

VizNov.prototype.Scene.prototype.Choice = function(options) {
	this.paths = options.paths;
};

VizNov.prototype.Character = function(options) {
	this.name = options.name;
	this.image = options.image;
	this.placement = options.placement;
};

/**
	* drawBox takes many parameters to draw an svg-element box,
	* typically for text (speech), or a button. The method draws
	* the box in the specificed location and returns a jquery
	* selector of the box object.
	*
	* @method drawBox
	* @param x the x-coordinate for the box's upper left corner.
	* @param y the y-coordinate for the box's upper left corner.
	* @param width the width of the box. Pixels or percentage is okay.
	* @param height the height of the box. Pixels or percentage is okay.
	* @param borderRadius defines the curve of the box's corners. Bigger is curvier.
	* @param id sets the id for the svg element being drawn.
	* @param classes an array of any additional class tags to add to the svg element
	* @param theme sort of redundant. adds a class that corresponds to preset themes (in CSS).
	* @param onClick a function to be run when the svg element is clicked.
	* @return a javascript selector of the svg element.
	*
	*/
VizNov.prototype.drawBox = function(x, y, width, height, borderRadius, id, classes, theme, onClick) {
		var newBox = $('#' + id),
		 	addClass = theme;
		if(classes) {
			$.each(classes, function() {
				addClass += ' ' + this;
			});
		}
		if(newBox.length === 0) {
			var speechBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			if(borderRadius > 0) {
		        speechBox.setAttribute("rx", borderRadius);
		        speechBox.setAttribute("ry", borderRadius);
		    }
	        speechBox.setAttribute("x", x);
	        speechBox.setAttribute("y", y);
	        speechBox.setAttribute("width", width);
	        speechBox.setAttribute("height", height);
	        speechBox.setAttribute("id", id);
	        speechBox.setAttribute("class", addClass);
	        document.getElementById('stuff').appendChild(speechBox);
	        newBox = $('#' + id);
	        newBox.click(onClick);
	    }
        return newBox;
};

/**
	* stepText writes out your text, one letter at a time.
	* Includes a little blinking cursor at the end.
	*
	* @param targetId the id of the element to write the text at
	* @param text the text to write
	* @param speed the speed in milliseconds (1000 = 1 sec)
	*/
VizNov.prototype.stepText = function(targetId, text, speed) {
    var textArray = text.split(""),
        loc = 0;
    var target = $("#" + targetId);
    var timer = setInterval(function() {
        if(loc < textArray.length) {
            target.text(target.text() + textArray[loc++]);
        }
        if(loc >= textArray.length) {
        	var cursHtml = '<img id="cursor"' +
        		'src ="assets/img/cursor.png" />';
    		target.append(cursHtml);
        	clearInterval(timer);
        	if (game) clearInterval(game.cursorBlink);
        	game.cursorBlink = setInterval(function() {
        		var cursor = $('#cursor');
        		if(cursor.css("opacity") > 0.5) {
        			cursor.fadeTo(50, 0);
        		} else {
        			cursor.fadeTo(50, 1);
        		}
        	}, 400);
        }
    }, speed);
};

/**
     * textBox draws a text in an svg element, for dialogue or buttons
     *
     * @param x the x-coordinate for the box's upper left corner.
	 * @param y the y-coordinate for the box's upper left corner.
	 * @param width the width of the box. Pixels or percentage is okay.
	 * @param height the height of the box. Pixels or percentage is okay.
	 * @param text the text to display
	 * @param decoration any formatting for the text.
	 * @param id sets the id for the text element being drawn.
	 * @param classes an array of any additional class tags to add to the text element
	 * @param stutter boolean value whether the text should print out all at once (false) or stuttered (true)
	 * @param onClick a function to be run when the text element is clicked.
	 * @return a javascript selector of the text element.
     */
VizNov.prototype.textBox = function(x, y, width, height, text, decoration, id, classes, stutter, onClick) {
	$('#cursor').remove();
	var textElement = $('#' + id);
	var addClass = '';
	if(classes)
		$.each(classes, function() {
			addClass += this + ' ';
		});
	if(textElement.length === 0) {
		$('#stuff').after('<div id="' + id + '"></div>');
		textElement = $('#' + id);
		textElement.css('position', 'fixed');
		textElement.css('top', y);
		textElement.css('left', x);
		textElement.css('height', height);
		textElement.css('width', width);
		textElement.css('font-style', decoration);
		textElement.addClass(addClass);
	} else {
		textElement.empty();
	}
	if(stutter)
		this.stepText(id, text, 25);
	else
		textElement.text(text);
	textElement.click(onClick);
	return textElement;
};

/**
 * showChoices draws a bunch of buttons to choose from.
 *
 * @param choices an array of text elements for each button
 * @param placement not really working, but a string to tell where you want the buttons to be at.
 *
 */
VizNov.prototype.showChoices = function(choices, placement) {
	var speechBox = $('#speechBox');
	if($('#character').length !== 0) $('#character').remove();
	if(speechBox.length !== 0) speechBox.remove();
	var y;
	var x;
	switch(placement) {
		case "bottom":
			y = window.innerHeight * 0.75;
		break;
		case "top":
			y = 75;
		break;
		case "left":
			x = 75;
		break;
		case "right":
			x = window.innerWidth - 150;
		break;
	}
	var numElements = choices.length;
	//find total width
	var elementMargin = 50;
	var elementWidth = 250;
	var elementHeight = 50;
	var totalWidth = numElements * elementWidth + (numElements - 1) * elementMargin;
	$.each(choices, function(index) {
		var choiceID = 'choice' + index;
		x = ((window.innerWidth - totalWidth) / 2) + ((elementWidth + elementMargin) * index);
		game.drawBox(
				x,
				y,
				elementWidth,
				elementHeight,
				5,
				choiceID,
				['choice'],
				'charcoal',
				function(e) {
					game.choiceClick($(e.target).closest('svg').next('div'));
				}
			);
		//text width of text
		var textDim = game.getTextDim(choices[index].text);
		game.textBox(
			(elementWidth - textDim.width) / 2 + x,
			y + (elementHeight - textDim.height) / 2,
			textDim.width,
			textDim.height,
			choices[index].text,
			null,
			'choiceText' + index,
			['choice'],
			false,
			function(e) {
					game.choiceClick($(e.target));
				}
			);
		var choice = $('#' + choiceID);
		choice.on({
				mouseenter: function() {
					$(this).next().attr('fill', 'gray');
				},
				mouseleave: function() {
					$(this).next().attr('fill', 'black');
				}
			});
		$('#choiceText' + index).on({
				mouseenter: function() {
					$(this).attr('fill', 'gray');
				},
				mouseleave: function() {
					$(this).attr('fill', 'black');
				}
			});
	});
};

/**
 * getTextDim is kinda stupid. It makes a hidden div and fills
 * it with text to see how big it will be on the screen. Currently
 * being used to size boxes. 
 *
 * @param text the text
 * @return an object with the width and height of the text.
 */
VizNov.prototype.getTextDim = function(text) {
	var textDiv = '<div style="display:none;" id="hiddenText"></div>';
	var body = $('body');
	body.append(textDiv);
	var hiddenText = $('#hiddenText');
	hiddenText.text(text);
	var width = hiddenText.width();
	var height = hiddenText.height();
	hiddenText.remove();
	return {
		width: width,
		height: height
	};
};

/**
 * showBackGround sets the background of your game
 *
 * @param background a url to the background you want to set
 */
VizNov.prototype.showBackground = function(background) {
	var html = $('html');
	var url = 'url(' + background + ')';
	html.css('background-image',url);
};

/**
 * showCharacter displays a character on the screen
 *
 * @param image a url to the image of the character
 * @param placement which side of the screen to put the character
 * @param style only working is 'dim', which reduces the opacity to 15%
 */
VizNov.prototype.showCharacter = function(image, placement, style) {
	var character = $('#character');
	if(character.length !== 0)
		character.remove();
	if(placement !== 'none') {
		var img = document.createElementNS('http://www.w3.org/2000/svg','image');
		img.setAttributeNS(null,'height', '800');
		img.setAttributeNS(null,'width', '500');
		img.setAttributeNS(null,'id','character');
		img.setAttributeNS('http://www.w3.org/1999/xlink','href',image);
		img.setAttributeNS(null,'y','100');
		switch(placement) {
			case('right'):
				img.setAttributeNS(null,'x', window.innerWidth - 550);
				break;
			case('left'):
				img.setAttributeNS(null,'x', 50);
				break;
		}
		//style stuff
		switch(style) {
			case('dim'):
				img.setAttributeNS(null, 'opacity', 0.15);
				break;
		}
		$('#stuff').prepend(img);
	}
};

/**
 * choiceClick alerts the game to which choice was clicked.
 *
 * @param node a jquery object of what was clicked.
 */
VizNov.prototype.choiceClick = function(node) {
	game.curPath.chosen(node.text());
};

/**
 * playSong plays a song. Loops if you to.
 *
 * @param song a url to an mp3.
 * @param loop boolean to loop (true) or not (false)
 */
VizNov.prototype.playSong = function(song, loop) {
	game.track = new Audio(song);
	if(loop)
		game.track.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
	game.track.play();
};

/**
 * transition defines a type of transition between scenes and triggers it.
 *
 * @param type a few options available for now, see below
 * @param complete yeah... not implemented. Probably was going to be a callback or something.
 */
VizNov.prototype.transition = function(type, complete) {
	if (game) clearInterval(game.cursorBlink);
	$('svg').empty();
	switch(type) {
		case undefined:
			$('#mask').css({display:'none'});
			complete();
			break;
		case "fadeInWhite":
			$('#mask').css({background: 'white', display:'inline'});
			$('#mask').fadeOut(2000,complete);
			break;
		case "fadeIn":
			$('#mask').css({background: 'black', display:'inline'});
			$('#mask').fadeOut(2000,complete);
			break;
		case "fadeOut":
			$('#mask').css({background: 'black'});
			$('#mask').fadeIn(2000,complete);
			break;
	}
};
