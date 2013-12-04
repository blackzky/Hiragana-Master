QUEUE = [];
INDEX = 0;
ENABLED = "a-series";
SCORE = 0;
TIME = 10;
MAX_TIME = 30;
MAX_SCORE = 100;
COUNTDOWN = 3;
TOTAL_ATTEMPTS = 0;

$(function(){
    $(".knob#score").knob({
        max: MAX_SCORE,
        draw : drawTron
    });

    $(".knob#time").knob({
        max: MAX_TIME,
        draw : drawTron
    });

    $("#game-countdown .knob#countdown").knob({
        max: COUNTDOWN,
        draw : drawTron
    });

    $("body").on("click", "#check", checkHandler);
    $("body").on("keyup", "#input", checkHandler);


	$('#game-countdown').modal({
		keyboard: false,
		show: false
	});

	$('#game-countdown').on('hidden.bs.modal', continueGame);

	$("#menu").modal('show');
	$("body").on("click", "#m-start, #go-restart", start);

	$("body").on("click", ".options", function(){
		$(".series").each(function(i, btn){
			toggleSeriesButtons(btn, false);
		});
		$("#options").modal({
			keyboard: false
		});
	});

	$("body").on("click", ".guide", function(){
		$("#guide").modal({
			keyboard: false
		});
	});

	$("body").on("click", ".exit", function(){
		navigator.app.exitApp();
	});

	$("body").on("click", ".series", toggleSeries);

	$("body").on("click", "#pause", togglePause);
	

	resizeCanvas();
	setGuideContent();
	setOptionButtons();
});

function setOptionButtons(){
	var data = "";
	for(i in Syllables){
		data += "<button class='btn btn-default series'>" + i + "</button>";
	}
	$("#options-btns").html(data);
}

function setGuideContent(){
	var data = "";
	var links = "<div id='up'>Select a series you want to view: <br />";
	for(i in Syllables){
		links += "<a href='#" + i + "'>" + i + "</a> | ";
		data += "<a href='#up' class='pull-right'>up</a>";
		data += "<h1 id='" + i + "'>" + i + "</h1>";
		for(j in Syllables[i]){
			data += "<div class='thumbnail'>";
			data += "<img src='img/" + Syllables[i][j] + ".jpg' class='img-thumbnail' />";
			data += "<div class='caption text-center'>" + Syllables[i][j] + "</div>";
			data += "</div>";
		}
	}
	links += "</div>";
	$("#guide-content").html(links + data);
};

function toggleSeriesButtons(btn, change_enabled){
	var t = $(btn).text();
	$(btn).removeClass("btn-info");
	$(btn).removeClass("btn-default");

	if(ENABLED.indexOf(t) === -1){
		if(change_enabled){
			ENABLED += t;
			$(btn).addClass("btn-info");
		}else{
			$(btn).addClass("btn-default");
		}
	}else{
		if(change_enabled){
			ENABLED = ENABLED.replace(t, "");
			$(btn).addClass("btn-default");
		}else{
			$(btn).addClass("btn-info");
		}

	}
}

function toggleSeries(){
	toggleSeriesButtons(this, true);
}

function continueGame(){
	$("#input").focus();
	TIMER = setInterval(function(){
		TIME--;
    	$('.knob#time').val(TIME).trigger('change');
    	if(TIME < 1){
    		$('.knob#score').val(SCORE).trigger('change');
    		$("#score-msg").text("Game over! Your score is: " + SCORE + " out of " + TOTAL_ATTEMPTS + " attempts.");
    		$("#game-over").modal('show');
    		clearInterval(TIMER);
    	}
	}, 1000);
}


function togglePause(){
	if($(this).text() == "Pause"){
		clearInterval(TIMER);
		$(this).text("Resume");
		$("#pass").addClass("disabled");
		$("#check").addClass("disabled");
		$("#input").prop("disabled", true);
	}else{
		$("#pass").removeClass("disabled");
		$("#check").removeClass("disabled");
		$("#input").prop("disabled", false);
		continueGame();
		$(this).text("Pause");
	}
}

function start(){
	MAX_TIME = parseInt($("#max_time").val()) || 30;
	$('.knob#time').trigger('configure',{"max": MAX_TIME});

	SCORE = 0;
	TOTAL_ATTEMPTS = 0;
	TIME = MAX_TIME;
	COUNTDOWN = 3;
	$(".modal").modal('hide');
	$('#game-countdown').modal("show");
	
	$('.knob#time').val(TIME).trigger('change');
	$('.knob#score').val(SCORE).trigger('change');
	$('.knob#countdown').val(COUNTDOWN).trigger('change');

	setQueue();

	COUNTDOWN_EVT = setInterval(function(){
		COUNTDOWN--;
    	$("#game-countdown .knob#countdown").val(COUNTDOWN).trigger('change');
    	if(COUNTDOWN < 1){
    		$('#game-countdown').modal("hide");
    		clearInterval(COUNTDOWN_EVT);
    		$("#input").focus();
    	}
    }, 1000);
}


function setQueue(){
	QUEUE = [];
	for(i in Syllables){
		if(ENABLED.indexOf(i) !== -1){ //if enabled
			QUEUE = QUEUE.concat(Syllables[i]);
		}
	}
	QUEUE = shuffle(QUEUE);
	INDEX = 0;

    setSyllable();
}

function setSyllable(){
	$("#syllable").attr("src", "img/" + QUEUE[INDEX] + ".jpg");
	$('#syllable').error(function() {
  		alert('Image does not exist!');
	});

	INDEX++;
	if(INDEX >= QUEUE.length){
		setQueue();
	}
}

function removeAlertClass(){
	$("#in-game-info").removeClass("alert-info");
	$("#in-game-info").removeClass("alert-success");
	$("#in-game-info").removeClass("alert-danger");
}

function check(){
	var input = $("#input").val();
	var img = $("#syllable").attr("src");
	var correct = img.substring(img.lastIndexOf("/")+1, img.lastIndexOf("."));
	var msg = "", cls = "alert-";
	removeAlertClass();

	TOTAL_ATTEMPTS++;
	if(input == correct){
		SCORE++;
		msg = "Correct!";
		cls += "info";
	}else{
		SCORE--;
		SCORE = SCORE < 0 ? 0 : SCORE;
		msg = "Wrong! The correct answer is '" + correct + "'";
		cls += "danger";
	}
	$('.knob#score').val(SCORE).trigger('change');
	$("#in-game-info").text(msg).addClass(cls);

	$("#input").val("").focus();
	setSyllable();
}

function checkHandler(e){
	$("#in-game-info").text("");
	if(TIME > 0){
		if(e.type == "keyup"){
			if(e.which == 13){
				check();
			}else if(e.which == 27){
				setSyllable();
			}else{
				$("#in-game-info").text("Trying...");
			}
		}else{
			check();
		}
	}else{
		$("#input").val("");
	}
}

function shuffle(array) {
  var currentIndex = array.length, 
  	temporaryValue,
  	randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}



function resizeCanvas(){
	$(".knob-parent").height($("canvas").width());
}



function drawTron(){
    if(this.$.data('skin') == 'tron') {
        var a = this.angle(this.cv)  // Angle
            , sa = this.startAngle          // Previous start angle
            , sat = this.startAngle         // Start angle
            , ea                            // Previous end angle
            , eat = sat + a                 // End angle
            , r = true;

        this.g.lineWidth = this.lineWidth;

        this.o.cursor
            && (sat = eat - 0.3)
            && (eat = eat + 0.3);

        if (this.o.displayPrevious) {
            ea = this.startAngle + this.angle(this.value);
            this.o.cursor
                && (sa = ea - 0.3)
                && (ea = ea + 0.3);
            this.g.beginPath();
            this.g.strokeStyle = this.previousColor;
            this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
            this.g.stroke();
        }

        this.g.beginPath();
        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
        this.g.stroke();

        this.g.lineWidth = 2;
        this.g.beginPath();
        this.g.strokeStyle = this.o.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
        this.g.stroke();

        return false;
    }
}