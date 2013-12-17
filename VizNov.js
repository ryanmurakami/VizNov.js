/*
	VizNov.js v0.1
	Released 12/16/2013
	https://github.com/ryanmurakami/VizNov.js
	@ryanmurakami

	See Github for license
*/

var VizNovHelper = {

	//returns a jquery element of the box element
	drawBox: function(x, y, width, height, borderRadius, id, classes, theme, onClick) {
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
	},

	stepText: function(targetId, text, speed) {
        var textArray = text.split(""),
            loc = 0;
        var target = $("#" + targetId);
        var timer = setInterval(function() {
            if(loc < textArray.length) {
                target.text(target.text() + textArray[loc++]);
            }
            if(loc >= textArray.length) {
            	var curs = document.createElementNS('http://www.w3.org/2000/svg','image');
				curs.setAttributeNS(null,'height', '20');
				curs.setAttributeNS(null,'width', '20');
				curs.setAttributeNS(null,'id','cursor');
				curs.setAttributeNS('http://www.w3.org/1999/xlink','href','assets/img/cursor.png');
				curs.setAttributeNS(null,'x', target.position().left + target.width() + 15);
				curs.setAttributeNS(null,'y',target.position().top + 5);
            	$(curs).insertAfter(target);
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
    },

	textBox: function(x, y, width, height, text, decoration, id, classes, stutter, onClick) {
		$('#cursor').remove();
		var textElement = $('#' + id);
		var addClass = '';
		if(classes)
			$.each(classes, function() {
				addClass += this + ' ';
			});
		if(textElement.length === 0) {
			var textBox = document.createElementNS("http://www.w3.org/2000/svg", "text");
			textBox.setAttribute("width", width);
			textBox.setAttribute("height", height);
			textBox.setAttribute("x", x);
			textBox.setAttribute("y", y);
			textBox.setAttribute("id", id);
			textBox.setAttribute("font-style", decoration);
			textBox.setAttribute("class", addClass);
			document.getElementById('stuff').appendChild(textBox);
			textElement = $('#' + id);
		} else {
			textElement.empty();
		}
		if(stutter)
			VizNovHelper.stepText(id, text, 25);
		else
			textElement.text(text);
		textElement.click(onClick);
	},

	showChoices: function(choices, placement) {
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
			VizNovHelper.drawBox(
					x,
					y,
					elementWidth,
					elementHeight,
					5,
					choiceID,
					['choice'],
					'charcoal',
					function(e) {
						VizNovHelper.choiceClick($(e.target).next());
					}
				);
			//text width of text
			var textDim = VizNovHelper.getTextDim(choices[index].text);
			VizNovHelper.textBox(
				(elementWidth - textDim.width) / 2 + x,
				y + elementHeight / 2 + 7,
				textDim.width,
				textDim.height,
				choices[index].text,
				null,
				'choiceText' + index,
				['choice'],
				false,
				function(e) {
						VizNovHelper.choiceClick($(e.target));
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
			//attach clicker
			//VizNovHelper.choiceClick(choice);
		});
	},

	getTextDim: function(text) {
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
	},

	showBackground: function(background) {
		var body = $('body');
		var url = 'url(' + background + ')';
		body.css('background-image',url);
		//background-image: url(images/menu.png);
	},

	showCharacter: function(image, placement, style) {
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
	},

	choiceClick: function(node) {
		game.curPath.chosen(node.text());
	},

	playSong: function(song, loop) {
		game.track = new Audio(song);
		if(loop)
			game.track.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
		game.track.play();
	},

	transition: function(type, complete) {
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
	},

	fileName: function(file) {
		if(!file) return '';
		var stringArr = file.split("/");
		return stringArr[stringArr.length - 1];
	}
};

var VizNov = function(options) {
	window.game = this;
	this.theme = options.theme;

	this.play = function() {
		if(!this.start) console.log("No starting scene.");
		else {
			this.start.play();
		}
	};

	this.stop = function() {
		$('body').empty();
		game.track.pause();
		game = null;
	};

	this.changeMusic = function(newSong, hard) {
		hard ? game.track.pause() : $(game.track).animate({volume: 0}, 1000);
		VizNovHelper.playSong(newSong, true);
	};

	this.changeBackground = function(newBackground) {
		VizNovHelper.showBackground(newBackground);
	};

	this.hideCharacter = function() {
		$('#character').remove();
	};

	this.Scene = function(options) {
		var background;		//image

		if(options) {
			background = options.background;
			this.inTrans = options.inTrans;
			this.outTrans = options.outTrans;
			this.music = options.music;
		}

		this.play = function() {
			//var curTrack = VizNovHelper.fileName(game.track.src);
			if(game.track) {
				if(VizNovHelper.fileName(game.track.src) !== VizNovHelper.fileName(this.music)) {
					$(game.track).animate({volume: 0}, 1000);
					if(this.music) VizNovHelper.playSong(this.music, true);
				}
			} else if(this.music) {
				VizNovHelper.playSong(this.music, true);
			}
			$('#stuff').empty();
			game.curScene = this;
			VizNovHelper.showBackground(background);
			var toPlay = this.mainPath;
			VizNovHelper.transition(this.inTrans, function() {
				toPlay.play();
			});
		};

		this.setMain = function(path) {
			this.mainPath = path;
			return this.mainPath;
		};

		this.Path = function(options) {
			this.text = options;
			this.lines = [];
			this.curLine = 0;
			this.line = function(line) {
				this.lines.push(line);
			};

			this.loadLines = function(lines) {
				var parent = this;
				$.each(lines, function() {
					parent.line(this);
				});
			};
			
			this.exit = function(scene) {
				this.nextScene = scene;
				return this;
			};

			this.playLine = function(index) {
				//line props: say, think, sound, from, after, before, choice
				var line = this.lines[index];
				var prevLine = this.lines[index - 1];
				//out of lines
				if(!line) {
					var toPlay = this.nextScene;
					VizNovHelper.transition(game.curScene.outTrans, function() {
						if (toPlay) toPlay.play();
						else game.stop();
					});
				} else {
					if (line.before) line.before();
					if (line.choice) VizNovHelper.showChoices(line.choice.paths, 'bottom'); 
					//nothing to say
					else if (!line.say && !line.think && !line.sound) game.curPath.nextLine();
					//lots to say
					else {
						//show a character if needed
						if(line.from) {
							if(!prevLine || line.from !== prevLine.from)
								VizNovHelper.showCharacter(line.from.image, line.placement ? line.placement : line.from.placement, line.style);
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
						VizNovHelper.drawBox(
							window.innerWidth * 0.025, 	//x
							window.innerHeight * 0.70,	//y
							window.innerWidth * 0.95,	//width
							window.innerHeight * 0.25,	//height
							20,							//borderRadius
							"speechBox",				//id
							null,
							window.game.theme,
							function() {
								$('text').remove();
								game.curPath.nextLine();
							});

						VizNovHelper.textBox(
							window.innerWidth * 0.025 + 30,
							window.innerHeight * 0.7 + 40,
							window.innerWidth * 0.95 - 60,
							window.innerHeight * 0.25 - 60,
							toSay,
							decoration,
							'text' + this.curLine,
							null,
							true,
							function() {
								$('text').remove();
								game.curPath.nextLine();
							});
					} 
					if(line.after) line.after();
				}
			};

			this.nextLine = function() {
				this.curLine++;
				this.playLine(this.curLine);
			};

			this.chosen = function(choice) {
				$('.choice').remove();
				var rightPath;
				$.each(this.lines[this.curLine].choice.paths, function() {
					if(this.text === choice)
						rightPath = this;
				});
				rightPath.play();
			};

			this.play = function(){
				game.curPath = this;
				this.playLine(this.curLine);
			};
		};

		this.Choice = function(options) {
			this.paths = options.paths;
		};
	};

	this.Character = function(options) {
		this.name = options.name;
		this.image = options.image;
		this.placement = options.placement;
	};
};