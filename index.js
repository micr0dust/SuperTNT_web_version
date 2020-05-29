var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
//載入
window.onload = function () {
	init();
}
function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp = AdobeAn.getComposition("B3C702FB945454448F8F5D400140133E");
	var lib = comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function (evt) { handleFileLoad(evt, comp) });
	loader.addEventListener("complete", function (evt) { handleComplete(evt, comp) });
	var lib = comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images = comp.getImages();
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }
}
function handleComplete(evt, comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib = comp.getLibrary();
	var ss = comp.getSpriteSheet();
	var queue = evt.target;
	var ssMetadata = lib.ssMetadata;
	for (i = 0; i < ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet({ "images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames })
	}
	exportRoot = new lib.vb();
	stage = new lib.Stage(canvas);

	const STEP = 50;
	let canplay = false;
	let step = 1;
	let isKeyDown = false;
	let gold_count = 0;
	var blocks = [1213];
	var block = [];
	let end = true;

	//Player1
	let p1die = false;
	let udlr = true;
	var robot = new lib.roboter();
	var player1_x = 12;
	var player1_y = 1;
	var score1 = 0;
	robot.x = 575;
	robot.y = 25;
	exportRoot.addChild(robot);
	robot.gotoAndPlay("down");

	//Player2
	let p2die = false;
	let step2 = 1;
	let udlr2 = true;
	var robot2 = new lib.roboter2();
	var player2_x = 1;
	var player2_y = 12;
	var score2 = 0;
	robot2.x = 25;
	robot2.y = 575;
	exportRoot.addChild(robot2);
	robot2.gotoAndPlay("up");

	var loadpoint = 0;
	var sounds = [
		{ src: "./assets/bgm1.mp3", id: "bg1" },
		{ src: "./assets/bgm4.mp3", id: "bg4" },
		{ src: "./assets/bgm6.mp3", id: "bg6" },
		{ src: "./assets/bgm8.mp3", id: "bg8" },
		{ src: "./assets/explode1.mp3", id: "exp1" },
		{ src: "./assets/explode2.mp3", id: "exp2" },
		{ src: "./assets/explode3.mp3", id: "exp3" },
		{ src: "./assets/explode4.mp3", id: "exp4" },
		{ src: "./assets/fuse.mp3", id: "fuse" },
		{ src: "./assets/point.mp3", id: "point" },
		{ src: "./assets/dead.mp3", id: "dead" },
	];
	createjs.Sound.alternateExtensions = ["mp3"];
	createjs.Sound.addEventListener("fileload", (e) => {
		loadpoint++;
		if (loadpoint === sounds.length) {
			// This is fired for each sound that is registered.
			document.querySelector(".gamePlayBtn").style.display = 'block';
		}
	})
	createjs.Sound.registerSounds(sounds);

	mapCreate();

	window.addEventListener("keydown", keydownMoveFn)
	window.addEventListener("keyup", keyupMoveFn)
	
	document.querySelector(".left1").addEventListener("touchstart", function () { touchdownMove(37) })
	document.querySelector(".up1").addEventListener("touchstart", function () { touchdownMove(38) })
	document.querySelector(".right1").addEventListener("touchstart", function () { touchdownMove(39) })
	document.querySelector(".down1").addEventListener("touchstart", function () { touchdownMove(40) })
	document.querySelector(".tnt1").addEventListener("touchstart", function () { touchdownMove(191) })
	document.querySelector(".left2").addEventListener("touchstart", function () { touchdownMove(65) })
	document.querySelector(".up2").addEventListener("touchstart", function () { touchdownMove(87) })
	document.querySelector(".right2").addEventListener("touchstart", function () { touchdownMove(68) })
	document.querySelector(".down2").addEventListener("touchstart", function () { touchdownMove(83) })
	document.querySelector(".tnt2").addEventListener("touchstart", function () { touchdownMove(71) })


	document.querySelector(".gamePlayBtn").addEventListener("click", () => {
		document.querySelector(".gamePlayBtn").style.display = 'none';
		document.getElementById("reload_back").style.display = "none";
		document.getElementById("reload").style.display = "none";
		bgAudio = createjs.Sound.play(bgm(), { loop: -1 });
		bgAudio.volume = 0.3;
		end = false;
		canplay = true;
	})

	function bgm() {
		let exp = Math.floor(Math.random() * (4 - 1 + 1) + 1);
		if (exp === 1) return "bg1";
		if (exp === 2) return "bg4";
		if (exp === 3) return "bg6";
		if (exp === 4) return "bg8";
	}

	function reset() {
		document.getElementById("reload_back").innerHTML = "按任意鍵改變地圖";
		document.getElementById("reload").innerHTML = "按任意鍵改變地圖";
		document.querySelector(".gamePlayBtn").style.display = 'block';
		document.getElementById("win").classList.remove("drew");
		document.getElementById("win").classList.remove("p1win");
		document.getElementById("win").classList.remove("p2win");
		document.getElementById("win").innerHTML = "";
		document.getElementById("win").classList.add("win");

		//Player1
		p1die = false;
		udlr = true;
		player1_x = 12;
		player1_y = 1;
		score1 = 0;
		robot.x = 575;
		robot.y = 25;
		robot.gotoAndPlay("down");

		//Player2
		p2die = false;
		step2 = 1;
		udlr2 = true;
		player2_x = 1;
		player2_y = 12;
		score2 = 0;
		robot2.x = 25;
		robot2.y = 575;
		robot2.gotoAndPlay("up");

		for (var i = 0; i < 13; i++) {
			for (var j = 0; j < 13; j++) {
				exportRoot.removeChild(block[i * 100 + j]);
			}
		}

		mapCreate();
	}



	function mapCreate() {

		gold_count = 0;

		let map = Math.floor(Math.random() * (13 - 1 + 1) + 1); //(最大-最小+1)+最小

		if (map === 1) {
			blocks[101] = 1; blocks[102] = 2; blocks[103] = 3; blocks[104] = 2; blocks[105] = 1; blocks[106] = 1; blocks[107] = 1; blocks[108] = 3; blocks[109] = 0; blocks[110] = 2; blocks[111] = 1; blocks[112] = 0; blocks[201] = 2; blocks[202] = 1; blocks[203] = 3; blocks[204] = 0; blocks[205] = 2; blocks[206] = 0; blocks[207] = 2; blocks[208] = 0; blocks[209] = 1; blocks[210] = 0; blocks[211] = 0; blocks[212] = 0; blocks[301] = 3; blocks[302] = 1; blocks[303] = 2; blocks[304] = 1; blocks[305] = 1; blocks[306] = 3; blocks[307] = 1; blocks[308] = 3; blocks[309] = 2; blocks[310] = 3; blocks[311] = 2; blocks[312] = 1; blocks[401] = 0; blocks[402] = 3; blocks[403] = 0; blocks[404] = 1; blocks[405] = 1; blocks[406] = 1; blocks[407] = 2; blocks[408] = 1; blocks[409] = 0; blocks[410] = 1; blocks[411] = 0; blocks[412] = 3; blocks[501] = 1; blocks[502] = 1; blocks[503] = 3; blocks[504] = 0; blocks[505] = 2; blocks[506] = 1; blocks[507] = 3; blocks[508] = 3; blocks[509] = 0; blocks[510] = 2; blocks[511] = 1; blocks[512] = 3; blocks[601] = 1; blocks[602] = 3; blocks[603] = 0; blocks[604] = 1; blocks[605] = 0; blocks[606] = 3; blocks[607] = 1; blocks[608] = 1; blocks[609] = 0; blocks[610] = 3; blocks[611] = 1; blocks[612] = 2; blocks[701] = 1; blocks[702] = 2; blocks[703] = 3; blocks[704] = 1; blocks[705] = 2; blocks[706] = 1; blocks[707] = 3; blocks[708] = 1; blocks[709] = 2; blocks[710] = 0; blocks[711] = 2; blocks[712] = 1; blocks[801] = 2; blocks[802] = 0; blocks[803] = 1; blocks[804] = 3; blocks[805] = 1; blocks[806] = 1; blocks[807] = 0; blocks[808] = 2; blocks[809] = 1; blocks[810] = 3; blocks[811] = 1; blocks[812] = 0; blocks[901] = 1; blocks[902] = 3; blocks[903] = 2; blocks[904] = 0; blocks[905] = 1; blocks[906] = 3; blocks[907] = 2; blocks[908] = 0; blocks[909] = 2; blocks[910] = 3; blocks[911] = 0; blocks[912] = 3; blocks[1001] = 2; blocks[1002] = 1; blocks[1003] = 1; blocks[1004] = 2; blocks[1005] = 1; blocks[1006] = 1; blocks[1007] = 0; blocks[1008] = 1; blocks[1009] = 3; blocks[1010] = 0; blocks[1011] = 2; blocks[1012] = 1; blocks[1101] = 0; blocks[1102] = 0; blocks[1103] = 3; blocks[1104] = 0; blocks[1105] = 3; blocks[1106] = 0; blocks[1107] = 2; blocks[1108] = 0; blocks[1109] = 1; blocks[1110] = 0; blocks[1111] = 1; blocks[1112] = 2; blocks[1201] = 0; blocks[1202] = 1; blocks[1203] = 1; blocks[1204] = 2; blocks[1205] = 1; blocks[1206] = 3; blocks[1207] = 1; blocks[1208] = 1; blocks[1209] = 1; blocks[1210] = 2; blocks[1211] = 0; blocks[1212] = 3;
		} else if (map === 2) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 3; blocks[104] = 0; blocks[105] = 3; blocks[106] = 2; blocks[107] = 2; blocks[108] = 3; blocks[109] = 0; blocks[110] = 3; blocks[111] = 0; blocks[112] = 0; blocks[201] = 0; blocks[202] = 1; blocks[203] = 1; blocks[204] = 2; blocks[205] = 2; blocks[206] = 2; blocks[207] = 2; blocks[208] = 2; blocks[209] = 2; blocks[210] = 1; blocks[211] = 1; blocks[212] = 0; blocks[301] = 3; blocks[302] = 1; blocks[303] = 3; blocks[304] = 2; blocks[305] = 2; blocks[306] = 2; blocks[307] = 2; blocks[308] = 2; blocks[309] = 2; blocks[310] = 3; blocks[311] = 1; blocks[312] = 3; blocks[401] = 0; blocks[402] = 2; blocks[403] = 2; blocks[404] = 1; blocks[405] = 2; blocks[406] = 2; blocks[407] = 2; blocks[408] = 2; blocks[409] = 1; blocks[410] = 2; blocks[411] = 2; blocks[412] = 0; blocks[501] = 3; blocks[502] = 2; blocks[503] = 2; blocks[504] = 2; blocks[505] = 1; blocks[506] = 1; blocks[507] = 1; blocks[508] = 1; blocks[509] = 2; blocks[510] = 2; blocks[511] = 2; blocks[512] = 3; blocks[601] = 2; blocks[602] = 2; blocks[603] = 2; blocks[604] = 2; blocks[605] = 1; blocks[606] = 3; blocks[607] = 3; blocks[608] = 1; blocks[609] = 2; blocks[610] = 2; blocks[611] = 2; blocks[612] = 2; blocks[701] = 2; blocks[702] = 2; blocks[703] = 2; blocks[704] = 2; blocks[705] = 1; blocks[706] = 3; blocks[707] = 3; blocks[708] = 1; blocks[709] = 2; blocks[710] = 2; blocks[711] = 2; blocks[712] = 2; blocks[801] = 3; blocks[802] = 2; blocks[803] = 2; blocks[804] = 2; blocks[805] = 1; blocks[806] = 1; blocks[807] = 1; blocks[808] = 1; blocks[809] = 2; blocks[810] = 2; blocks[811] = 2; blocks[812] = 3; blocks[901] = 0; blocks[902] = 2; blocks[903] = 2; blocks[904] = 1; blocks[905] = 2; blocks[906] = 2; blocks[907] = 2; blocks[908] = 2; blocks[909] = 1; blocks[910] = 2; blocks[911] = 2; blocks[912] = 0; blocks[1001] = 3; blocks[1002] = 1; blocks[1003] = 3; blocks[1004] = 2; blocks[1005] = 2; blocks[1006] = 2; blocks[1007] = 2; blocks[1008] = 2; blocks[1009] = 2; blocks[1010] = 3; blocks[1011] = 1; blocks[1012] = 3; blocks[1101] = 0; blocks[1102] = 1; blocks[1103] = 1; blocks[1104] = 2; blocks[1105] = 2; blocks[1106] = 2; blocks[1107] = 2; blocks[1108] = 2; blocks[1109] = 2; blocks[1110] = 1; blocks[1111] = 1; blocks[1112] = 0; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 3; blocks[1204] = 0; blocks[1205] = 3; blocks[1206] = 2; blocks[1207] = 2; blocks[1208] = 3; blocks[1209] = 0; blocks[1210] = 3; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 3) {
			blocks[101] = 1; blocks[102] = 1; blocks[103] = 2; blocks[104] = 1; blocks[105] = 1; blocks[106] = 1; blocks[107] = 2; blocks[108] = 1; blocks[109] = 1; blocks[110] = 2; blocks[111] = 0; blocks[112] = 0; blocks[201] = 2; blocks[202] = 3; blocks[203] = 0; blocks[204] = 1; blocks[205] = 0; blocks[206] = 1; blocks[207] = 3; blocks[208] = 1; blocks[209] = 0; blocks[210] = 3; blocks[211] = 0; blocks[212] = 1; blocks[301] = 1; blocks[302] = 1; blocks[303] = 3; blocks[304] = 1; blocks[305] = 0; blocks[306] = 3; blocks[307] = 0; blocks[308] = 1; blocks[309] = 0; blocks[310] = 1; blocks[311] = 1; blocks[312] = 1; blocks[401] = 1; blocks[402] = 1; blocks[403] = 0; blocks[404] = 1; blocks[405] = 1; blocks[406] = 1; blocks[407] = 3; blocks[408] = 3; blocks[409] = 0; blocks[410] = 0; blocks[411] = 3; blocks[412] = 2; blocks[501] = 2; blocks[502] = 3; blocks[503] = 0; blocks[504] = 3; blocks[505] = 0; blocks[506] = 3; blocks[507] = 0; blocks[508] = 1; blocks[509] = 3; blocks[510] = 1; blocks[511] = 1; blocks[512] = 1; blocks[601] = 1; blocks[602] = 1; blocks[603] = 0; blocks[604] = 1; blocks[605] = 1; blocks[606] = 1; blocks[607] = 1; blocks[608] = 1; blocks[609] = 3; blocks[610] = 0; blocks[611] = 3; blocks[612] = 1; blocks[701] = 2; blocks[702] = 3; blocks[703] = 0; blocks[704] = 3; blocks[705] = 3; blocks[706] = 0; blocks[707] = 3; blocks[708] = 1; blocks[709] = 1; blocks[710] = 1; blocks[711] = 0; blocks[712] = 3; blocks[801] = 1; blocks[802] = 1; blocks[803] = 1; blocks[804] = 0; blocks[805] = 1; blocks[806] = 1; blocks[807] = 3; blocks[808] = 0; blocks[809] = 3; blocks[810] = 3; blocks[811] = 1; blocks[812] = 0; blocks[901] = 2; blocks[902] = 1; blocks[903] = 1; blocks[904] = 3; blocks[905] = 0; blocks[906] = 3; blocks[907] = 1; blocks[908] = 3; blocks[909] = 1; blocks[910] = 0; blocks[911] = 1; blocks[912] = 3; blocks[1001] = 3; blocks[1002] = 0; blocks[1003] = 1; blocks[1004] = 0; blocks[1005] = 1; blocks[1006] = 0; blocks[1007] = 3; blocks[1008] = 0; blocks[1009] = 1; blocks[1010] = 0; blocks[1011] = 3; blocks[1012] = 0; blocks[1101] = 1; blocks[1102] = 3; blocks[1103] = 1; blocks[1104] = 3; blocks[1105] = 1; blocks[1106] = 3; blocks[1107] = 1; blocks[1108] = 2; blocks[1109] = 1; blocks[1110] = 0; blocks[1111] = 1; blocks[1112] = 3; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 0; blocks[1205] = 1; blocks[1206] = 2; blocks[1207] = 1; blocks[1208] = 1; blocks[1209] = 2; blocks[1210] = 3; blocks[1211] = 1; blocks[1212] = 2;
		} else if (map === 4) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 0; blocks[104] = 0; blocks[105] = 3; blocks[106] = 2; blocks[107] = 2; blocks[108] = 3; blocks[109] = 0; blocks[110] = 0; blocks[111] = 0; blocks[112] = 0; blocks[201] = 0; blocks[202] = 1; blocks[203] = 1; blocks[204] = 0; blocks[205] = 0; blocks[206] = 1; blocks[207] = 1; blocks[208] = 0; blocks[209] = 0; blocks[210] = 1; blocks[211] = 1; blocks[212] = 0; blocks[301] = 3; blocks[302] = 1; blocks[303] = 3; blocks[304] = 0; blocks[305] = 1; blocks[306] = 2; blocks[307] = 2; blocks[308] = 1; blocks[309] = 0; blocks[310] = 3; blocks[311] = 1; blocks[312] = 3; blocks[401] = 3; blocks[402] = 1; blocks[403] = 3; blocks[404] = 1; blocks[405] = 2; blocks[406] = 3; blocks[407] = 3; blocks[408] = 2; blocks[409] = 1; blocks[410] = 3; blocks[411] = 1; blocks[412] = 3; blocks[501] = 3; blocks[502] = 1; blocks[503] = 3; blocks[504] = 1; blocks[505] = 3; blocks[506] = 1; blocks[507] = 1; blocks[508] = 3; blocks[509] = 1; blocks[510] = 3; blocks[511] = 1; blocks[512] = 3; blocks[601] = 2; blocks[602] = 1; blocks[603] = 3; blocks[604] = 2; blocks[605] = 3; blocks[606] = 2; blocks[607] = 2; blocks[608] = 3; blocks[609] = 2; blocks[610] = 3; blocks[611] = 1; blocks[612] = 2; blocks[701] = 2; blocks[702] = 1; blocks[703] = 3; blocks[704] = 2; blocks[705] = 3; blocks[706] = 2; blocks[707] = 2; blocks[708] = 3; blocks[709] = 2; blocks[710] = 3; blocks[711] = 1; blocks[712] = 2; blocks[801] = 3; blocks[802] = 1; blocks[803] = 3; blocks[804] = 1; blocks[805] = 3; blocks[806] = 1; blocks[807] = 1; blocks[808] = 3; blocks[809] = 1; blocks[810] = 3; blocks[811] = 1; blocks[812] = 3; blocks[901] = 3; blocks[902] = 1; blocks[903] = 3; blocks[904] = 1; blocks[905] = 2; blocks[906] = 3; blocks[907] = 3; blocks[908] = 2; blocks[909] = 1; blocks[910] = 3; blocks[911] = 1; blocks[912] = 3; blocks[1001] = 3; blocks[1002] = 1; blocks[1003] = 3; blocks[1004] = 0; blocks[1005] = 1; blocks[1006] = 2; blocks[1007] = 2; blocks[1008] = 1; blocks[1009] = 0; blocks[1010] = 3; blocks[1011] = 1; blocks[1012] = 3; blocks[1101] = 0; blocks[1102] = 1; blocks[1103] = 1; blocks[1104] = 0; blocks[1105] = 0; blocks[1106] = 1; blocks[1107] = 1; blocks[1108] = 0; blocks[1109] = 0; blocks[1110] = 1; blocks[1111] = 1; blocks[1112] = 0; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 0; blocks[1205] = 3; blocks[1206] = 2; blocks[1207] = 2; blocks[1208] = 3; blocks[1209] = 0; blocks[1210] = 0; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 5) {
			blocks[101] = 3; blocks[102] = 3; blocks[103] = 0; blocks[104] = 0; blocks[105] = 3; blocks[106] = 3; blocks[107] = 3; blocks[108] = 3; blocks[109] = 1; blocks[110] = 0; blocks[111] = 0; blocks[112] = 0; blocks[201] = 3; blocks[202] = 3; blocks[203] = 0; blocks[204] = 0; blocks[205] = 3; blocks[206] = 2; blocks[207] = 2; blocks[208] = 3; blocks[209] = 0; blocks[210] = 0; blocks[211] = 0; blocks[212] = 0; blocks[301] = 2; blocks[302] = 0; blocks[303] = 1; blocks[304] = 0; blocks[305] = 3; blocks[306] = 2; blocks[307] = 2; blocks[308] = 3; blocks[309] = 1; blocks[310] = 0; blocks[311] = 1; blocks[312] = 1; blocks[401] = 0; blocks[402] = 0; blocks[403] = 1; blocks[404] = 0; blocks[405] = 3; blocks[406] = 3; blocks[407] = 3; blocks[408] = 3; blocks[409] = 1; blocks[410] = 0; blocks[411] = 1; blocks[412] = 1; blocks[501] = 0; blocks[502] = 0; blocks[503] = 1; blocks[504] = 1; blocks[505] = 1; blocks[506] = 1; blocks[507] = 1; blocks[508] = 1; blocks[509] = 1; blocks[510] = 0; blocks[511] = 2; blocks[512] = 1; blocks[601] = 1; blocks[602] = 0; blocks[603] = 0; blocks[604] = 0; blocks[605] = 0; blocks[606] = 3; blocks[607] = 3; blocks[608] = 0; blocks[609] = 0; blocks[610] = 0; blocks[611] = 0; blocks[612] = 1; blocks[701] = 1; blocks[702] = 0; blocks[703] = 0; blocks[704] = 0; blocks[705] = 0; blocks[706] = 3; blocks[707] = 3; blocks[708] = 0; blocks[709] = 0; blocks[710] = 0; blocks[711] = 0; blocks[712] = 1; blocks[801] = 1; blocks[802] = 2; blocks[803] = 0; blocks[804] = 1; blocks[805] = 1; blocks[806] = 1; blocks[807] = 1; blocks[808] = 1; blocks[809] = 1; blocks[810] = 1; blocks[811] = 0; blocks[812] = 0; blocks[901] = 1; blocks[902] = 1; blocks[903] = 0; blocks[904] = 1; blocks[905] = 3; blocks[906] = 3; blocks[907] = 3; blocks[908] = 3; blocks[909] = 0; blocks[910] = 1; blocks[911] = 0; blocks[912] = 0; blocks[1001] = 1; blocks[1002] = 1; blocks[1003] = 0; blocks[1004] = 0; blocks[1005] = 3; blocks[1006] = 2; blocks[1007] = 2; blocks[1008] = 3; blocks[1009] = 0; blocks[1010] = 1; blocks[1011] = 0; blocks[1012] = 2; blocks[1101] = 0; blocks[1102] = 0; blocks[1103] = 0; blocks[1104] = 0; blocks[1105] = 3; blocks[1106] = 2; blocks[1107] = 2; blocks[1108] = 3; blocks[1109] = 0; blocks[1110] = 0; blocks[1111] = 3; blocks[1112] = 3; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 1; blocks[1205] = 3; blocks[1206] = 3; blocks[1207] = 3; blocks[1208] = 3; blocks[1209] = 1; blocks[1210] = 0; blocks[1211] = 3; blocks[1212] = 3;
		} else if (map === 6) {
			blocks[101] = 0; blocks[102] = 3; blocks[103] = 3; blocks[104] = 2; blocks[105] = 3; blocks[106] = 0; blocks[107] = 0; blocks[108] = 3; blocks[109] = 2; blocks[110] = 3; blocks[111] = 0; blocks[112] = 0; blocks[201] = 3; blocks[202] = 1; blocks[203] = 1; blocks[204] = 3; blocks[205] = 1; blocks[206] = 1; blocks[207] = 1; blocks[208] = 1; blocks[209] = 3; blocks[210] = 1; blocks[211] = 1; blocks[212] = 0; blocks[301] = 0; blocks[302] = 1; blocks[303] = 3; blocks[304] = 2; blocks[305] = 3; blocks[306] = 2; blocks[307] = 2; blocks[308] = 3; blocks[309] = 2; blocks[310] = 3; blocks[311] = 1; blocks[312] = 0; blocks[401] = 0; blocks[402] = 1; blocks[403] = 2; blocks[404] = 1; blocks[405] = 1; blocks[406] = 1; blocks[407] = 3; blocks[408] = 1; blocks[409] = 1; blocks[410] = 2; blocks[411] = 1; blocks[412] = 0; blocks[501] = 3; blocks[502] = 1; blocks[503] = 3; blocks[504] = 1; blocks[505] = 2; blocks[506] = 3; blocks[507] = 2; blocks[508] = 2; blocks[509] = 1; blocks[510] = 3; blocks[511] = 1; blocks[512] = 3; blocks[601] = 2; blocks[602] = 3; blocks[603] = 2; blocks[604] = 3; blocks[605] = 2; blocks[606] = 1; blocks[607] = 2; blocks[608] = 2; blocks[609] = 1; blocks[610] = 2; blocks[611] = 3; blocks[612] = 2; blocks[701] = 3; blocks[702] = 1; blocks[703] = 1; blocks[704] = 1; blocks[705] = 3; blocks[706] = 1; blocks[707] = 1; blocks[708] = 3; blocks[709] = 1; blocks[710] = 3; blocks[711] = 1; blocks[712] = 3; blocks[801] = 2; blocks[802] = 3; blocks[803] = 2; blocks[804] = 1; blocks[805] = 2; blocks[806] = 3; blocks[807] = 2; blocks[808] = 2; blocks[809] = 3; blocks[810] = 2; blocks[811] = 1; blocks[812] = 0; blocks[901] = 3; blocks[902] = 1; blocks[903] = 2; blocks[904] = 1; blocks[905] = 3; blocks[906] = 1; blocks[907] = 1; blocks[908] = 1; blocks[909] = 1; blocks[910] = 3; blocks[911] = 1; blocks[912] = 0; blocks[1001] = 0; blocks[1002] = 1; blocks[1003] = 2; blocks[1004] = 3; blocks[1005] = 2; blocks[1006] = 3; blocks[1007] = 2; blocks[1008] = 2; blocks[1009] = 2; blocks[1010] = 2; blocks[1011] = 1; blocks[1012] = 0; blocks[1101] = 0; blocks[1102] = 1; blocks[1103] = 1; blocks[1104] = 1; blocks[1105] = 3; blocks[1106] = 1; blocks[1107] = 1; blocks[1108] = 1; blocks[1109] = 1; blocks[1110] = 3; blocks[1111] = 1; blocks[1112] = 0; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 3; blocks[1205] = 2; blocks[1206] = 3; blocks[1207] = 0; blocks[1208] = 0; blocks[1209] = 0; blocks[1210] = 0; blocks[1211] = 3; blocks[1212] = 0;
		} else if (map === 7) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 1; blocks[104] = 0; blocks[105] = 3; blocks[106] = 0; blocks[107] = 1; blocks[108] = 0; blocks[109] = 3; blocks[110] = 2; blocks[111] = 1; blocks[112] = 0; blocks[201] = 2; blocks[202] = 1; blocks[203] = 2; blocks[204] = 0; blocks[205] = 1; blocks[206] = 2; blocks[207] = 3; blocks[208] = 0; blocks[209] = 1; blocks[210] = 1; blocks[211] = 0; blocks[212] = 0; blocks[301] = 0; blocks[302] = 0; blocks[303] = 1; blocks[304] = 1; blocks[305] = 3; blocks[306] = 0; blocks[307] = 1; blocks[308] = 1; blocks[309] = 2; blocks[310] = 0; blocks[311] = 1; blocks[312] = 2; blocks[401] = 3; blocks[402] = 0; blocks[403] = 3; blocks[404] = 0; blocks[405] = 1; blocks[406] = 0; blocks[407] = 2; blocks[408] = 0; blocks[409] = 1; blocks[410] = 0; blocks[411] = 3; blocks[412] = 0; blocks[501] = 2; blocks[502] = 1; blocks[503] = 1; blocks[504] = 2; blocks[505] = 3; blocks[506] = 0; blocks[507] = 1; blocks[508] = 0; blocks[509] = 3; blocks[510] = 0; blocks[511] = 1; blocks[512] = 0; blocks[601] = 0; blocks[602] = 0; blocks[603] = 3; blocks[604] = 0; blocks[605] = 1; blocks[606] = 1; blocks[607] = 2; blocks[608] = 0; blocks[609] = 1; blocks[610] = 1; blocks[611] = 3; blocks[612] = 0; blocks[701] = 3; blocks[702] = 0; blocks[703] = 1; blocks[704] = 1; blocks[705] = 3; blocks[706] = 0; blocks[707] = 1; blocks[708] = 1; blocks[709] = 2; blocks[710] = 0; blocks[711] = 1; blocks[712] = 2; blocks[801] = 2; blocks[802] = 1; blocks[803] = 2; blocks[804] = 0; blocks[805] = 1; blocks[806] = 2; blocks[807] = 3; blocks[808] = 0; blocks[809] = 1; blocks[810] = 0; blocks[811] = 3; blocks[812] = 0; blocks[901] = 0; blocks[902] = 0; blocks[903] = 1; blocks[904] = 0; blocks[905] = 3; blocks[906] = 0; blocks[907] = 1; blocks[908] = 0; blocks[909] = 3; blocks[910] = 0; blocks[911] = 1; blocks[912] = 2; blocks[1001] = 2; blocks[1002] = 0; blocks[1003] = 3; blocks[1004] = 0; blocks[1005] = 1; blocks[1006] = 1; blocks[1007] = 2; blocks[1008] = 0; blocks[1009] = 1; blocks[1010] = 1; blocks[1011] = 3; blocks[1012] = 0; blocks[1101] = 0; blocks[1102] = 1; blocks[1103] = 1; blocks[1104] = 1; blocks[1105] = 3; blocks[1106] = 0; blocks[1107] = 1; blocks[1108] = 1; blocks[1109] = 2; blocks[1110] = 0; blocks[1111] = 1; blocks[1112] = 2; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 3; blocks[1204] = 2; blocks[1205] = 1; blocks[1206] = 2; blocks[1207] = 3; blocks[1208] = 0; blocks[1209] = 1; blocks[1210] = 0; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 8) {
			blocks[101] = 2; blocks[102] = 2; blocks[103] = 3; blocks[104] = 0; blocks[105] = 3; blocks[106] = 0; blocks[107] = 3; blocks[108] = 0; blocks[109] = 3; blocks[110] = 0; blocks[111] = 0; blocks[112] = 0; blocks[201] = 2; blocks[202] = 2; blocks[203] = 0; blocks[204] = 3; blocks[205] = 0; blocks[206] = 3; blocks[207] = 0; blocks[208] = 0; blocks[209] = 1; blocks[210] = 0; blocks[211] = 0; blocks[212] = 0; blocks[301] = 3; blocks[302] = 0; blocks[303] = 3; blocks[304] = 1; blocks[305] = 1; blocks[306] = 3; blocks[307] = 2; blocks[308] = 1; blocks[309] = 1; blocks[310] = 0; blocks[311] = 0; blocks[312] = 1; blocks[401] = 0; blocks[402] = 3; blocks[403] = 1; blocks[404] = 3; blocks[405] = 3; blocks[406] = 3; blocks[407] = 3; blocks[408] = 3; blocks[409] = 3; blocks[410] = 0; blocks[411] = 3; blocks[412] = 1; blocks[501] = 3; blocks[502] = 0; blocks[503] = 1; blocks[504] = 3; blocks[505] = 2; blocks[506] = 2; blocks[507] = 2; blocks[508] = 2; blocks[509] = 3; blocks[510] = 1; blocks[511] = 1; blocks[512] = 1; blocks[601] = 0; blocks[602] = 3; blocks[603] = 1; blocks[604] = 2; blocks[605] = 2; blocks[606] = 2; blocks[607] = 2; blocks[608] = 2; blocks[609] = 2; blocks[610] = 1; blocks[611] = 2; blocks[612] = 3; blocks[701] = 3; blocks[702] = 2; blocks[703] = 1; blocks[704] = 2; blocks[705] = 2; blocks[706] = 2; blocks[707] = 2; blocks[708] = 2; blocks[709] = 2; blocks[710] = 1; blocks[711] = 3; blocks[712] = 0; blocks[801] = 1; blocks[802] = 1; blocks[803] = 1; blocks[804] = 3; blocks[805] = 2; blocks[806] = 2; blocks[807] = 2; blocks[808] = 2; blocks[809] = 3; blocks[810] = 1; blocks[811] = 0; blocks[812] = 3; blocks[901] = 1; blocks[902] = 3; blocks[903] = 0; blocks[904] = 3; blocks[905] = 3; blocks[906] = 3; blocks[907] = 3; blocks[908] = 3; blocks[909] = 3; blocks[910] = 1; blocks[911] = 3; blocks[912] = 0; blocks[1001] = 1; blocks[1002] = 0; blocks[1003] = 0; blocks[1004] = 1; blocks[1005] = 1; blocks[1006] = 2; blocks[1007] = 3; blocks[1008] = 1; blocks[1009] = 1; blocks[1010] = 3; blocks[1011] = 0; blocks[1012] = 3; blocks[1101] = 0; blocks[1102] = 0; blocks[1103] = 0; blocks[1104] = 1; blocks[1105] = 0; blocks[1106] = 0; blocks[1107] = 3; blocks[1108] = 0; blocks[1109] = 3; blocks[1110] = 0; blocks[1111] = 2; blocks[1112] = 2; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 3; blocks[1205] = 0; blocks[1206] = 3; blocks[1207] = 0; blocks[1208] = 3; blocks[1209] = 0; blocks[1210] = 3; blocks[1211] = 2; blocks[1212] = 2;
		} else if (map === 9) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 0; blocks[104] = 0; blocks[105] = 0; blocks[106] = 0; blocks[107] = 0; blocks[108] = 0; blocks[109] = 0; blocks[110] = 0; blocks[111] = 0; blocks[112] = 0; blocks[201] = 1; blocks[202] = 3; blocks[203] = 1; blocks[204] = 2; blocks[205] = 2; blocks[206] = 1; blocks[207] = 1; blocks[208] = 2; blocks[209] = 2; blocks[210] = 1; blocks[211] = 3; blocks[212] = 1; blocks[301] = 0; blocks[302] = 0; blocks[303] = 0; blocks[304] = 0; blocks[305] = 0; blocks[306] = 0; blocks[307] = 0; blocks[308] = 0; blocks[309] = 0; blocks[310] = 0; blocks[311] = 0; blocks[312] = 0; blocks[401] = 2; blocks[402] = 2; blocks[403] = 1; blocks[404] = 3; blocks[405] = 1; blocks[406] = 2; blocks[407] = 2; blocks[408] = 1; blocks[409] = 3; blocks[410] = 1; blocks[411] = 2; blocks[412] = 2; blocks[501] = 0; blocks[502] = 0; blocks[503] = 0; blocks[504] = 0; blocks[505] = 0; blocks[506] = 0; blocks[507] = 0; blocks[508] = 0; blocks[509] = 0; blocks[510] = 0; blocks[511] = 0; blocks[512] = 0; blocks[601] = 3; blocks[602] = 1; blocks[603] = 1; blocks[604] = 2; blocks[605] = 2; blocks[606] = 1; blocks[607] = 1; blocks[608] = 2; blocks[609] = 2; blocks[610] = 1; blocks[611] = 1; blocks[612] = 3; blocks[701] = 3; blocks[702] = 1; blocks[703] = 1; blocks[704] = 2; blocks[705] = 2; blocks[706] = 1; blocks[707] = 1; blocks[708] = 2; blocks[709] = 2; blocks[710] = 1; blocks[711] = 1; blocks[712] = 3; blocks[801] = 0; blocks[802] = 0; blocks[803] = 0; blocks[804] = 0; blocks[805] = 0; blocks[806] = 0; blocks[807] = 0; blocks[808] = 0; blocks[809] = 0; blocks[810] = 0; blocks[811] = 0; blocks[812] = 0; blocks[901] = 2; blocks[902] = 2; blocks[903] = 1; blocks[904] = 3; blocks[905] = 1; blocks[906] = 2; blocks[907] = 2; blocks[908] = 1; blocks[909] = 3; blocks[910] = 1; blocks[911] = 2; blocks[912] = 2; blocks[1001] = 0; blocks[1002] = 0; blocks[1003] = 0; blocks[1004] = 0; blocks[1005] = 0; blocks[1006] = 0; blocks[1007] = 0; blocks[1008] = 0; blocks[1009] = 0; blocks[1010] = 0; blocks[1011] = 0; blocks[1012] = 0; blocks[1101] = 1; blocks[1102] = 3; blocks[1103] = 1; blocks[1104] = 2; blocks[1105] = 2; blocks[1106] = 1; blocks[1107] = 1; blocks[1108] = 2; blocks[1109] = 2; blocks[1110] = 1; blocks[1111] = 3; blocks[1112] = 1; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 0; blocks[1204] = 0; blocks[1205] = 0; blocks[1206] = 0; blocks[1207] = 0; blocks[1208] = 0; blocks[1209] = 0; blocks[1210] = 0; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 10) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 0; blocks[104] = 0; blocks[105] = 2; blocks[106] = 0; blocks[107] = 1; blocks[108] = 0; blocks[109] = 2; blocks[110] = 0; blocks[111] = 1; blocks[112] = 0; blocks[201] = 2; blocks[202] = 1; blocks[203] = 1; blocks[204] = 1; blocks[205] = 1; blocks[206] = 2; blocks[207] = 1; blocks[208] = 0; blocks[209] = 1; blocks[210] = 0; blocks[211] = 1; blocks[212] = 0; blocks[301] = 0; blocks[302] = 0; blocks[303] = 0; blocks[304] = 2; blocks[305] = 1; blocks[306] = 0; blocks[307] = 1; blocks[308] = 2; blocks[309] = 1; blocks[310] = 0; blocks[311] = 2; blocks[312] = 0; blocks[401] = 1; blocks[402] = 1; blocks[403] = 1; blocks[404] = 0; blocks[405] = 1; blocks[406] = 0; blocks[407] = 1; blocks[408] = 0; blocks[409] = 2; blocks[410] = 1; blocks[411] = 1; blocks[412] = 1; blocks[501] = 2; blocks[502] = 2; blocks[503] = 1; blocks[504] = 3; blocks[505] = 1; blocks[506] = 2; blocks[507] = 0; blocks[508] = 1; blocks[509] = 0; blocks[510] = 2; blocks[511] = 0; blocks[512] = 0; blocks[601] = 0; blocks[602] = 0; blocks[603] = 0; blocks[604] = 0; blocks[605] = 2; blocks[606] = 1; blocks[607] = 2; blocks[608] = 0; blocks[609] = 1; blocks[610] = 1; blocks[611] = 1; blocks[612] = 2; blocks[701] = 2; blocks[702] = 1; blocks[703] = 1; blocks[704] = 1; blocks[705] = 0; blocks[706] = 2; blocks[707] = 1; blocks[708] = 2; blocks[709] = 0; blocks[710] = 0; blocks[711] = 0; blocks[712] = 0; blocks[801] = 0; blocks[802] = 0; blocks[803] = 2; blocks[804] = 0; blocks[805] = 1; blocks[806] = 0; blocks[807] = 2; blocks[808] = 1; blocks[809] = 3; blocks[810] = 1; blocks[811] = 2; blocks[812] = 2; blocks[901] = 1; blocks[902] = 1; blocks[903] = 1; blocks[904] = 2; blocks[905] = 0; blocks[906] = 1; blocks[907] = 0; blocks[908] = 1; blocks[909] = 0; blocks[910] = 1; blocks[911] = 1; blocks[912] = 1; blocks[1001] = 0; blocks[1002] = 2; blocks[1003] = 0; blocks[1004] = 1; blocks[1005] = 2; blocks[1006] = 1; blocks[1007] = 0; blocks[1008] = 1; blocks[1009] = 2; blocks[1010] = 0; blocks[1011] = 0; blocks[1012] = 0; blocks[1101] = 0; blocks[1102] = 1; blocks[1103] = 0; blocks[1104] = 1; blocks[1105] = 0; blocks[1106] = 1; blocks[1107] = 2; blocks[1108] = 1; blocks[1109] = 1; blocks[1110] = 1; blocks[1111] = 1; blocks[1112] = 2; blocks[1201] = 0; blocks[1202] = 1; blocks[1203] = 0; blocks[1204] = 2; blocks[1205] = 0; blocks[1206] = 1; blocks[1207] = 0; blocks[1208] = 2; blocks[1209] = 0; blocks[1210] = 0; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 11) {
			blocks[101] = 1; blocks[102] = 1; blocks[103] = 1; blocks[104] = 1; blocks[105] = 1; blocks[106] = 1; blocks[107] = 1; blocks[108] = 1; blocks[109] = 1; blocks[110] = 1; blocks[111] = 0; blocks[112] = 0; blocks[201] = 1; blocks[202] = 1; blocks[203] = 1; blocks[204] = 1; blocks[205] = 3; blocks[206] = 0; blocks[207] = 3; blocks[208] = 0; blocks[209] = 0; blocks[210] = 0; blocks[211] = 0; blocks[212] = 0; blocks[301] = 1; blocks[302] = 1; blocks[303] = 1; blocks[304] = 0; blocks[305] = 0; blocks[306] = 0; blocks[307] = 0; blocks[308] = 0; blocks[309] = 0; blocks[310] = 3; blocks[311] = 0; blocks[312] = 1; blocks[401] = 1; blocks[402] = 1; blocks[403] = 0; blocks[404] = 3; blocks[405] = 0; blocks[406] = 1; blocks[407] = 1; blocks[408] = 3; blocks[409] = 0; blocks[410] = 0; blocks[411] = 0; blocks[412] = 1; blocks[501] = 1; blocks[502] = 3; blocks[503] = 0; blocks[504] = 0; blocks[505] = 1; blocks[506] = 1; blocks[507] = 1; blocks[508] = 1; blocks[509] = 3; blocks[510] = 0; blocks[511] = 0; blocks[512] = 1; blocks[601] = 1; blocks[602] = 0; blocks[603] = 0; blocks[604] = 1; blocks[605] = 1; blocks[606] = 2; blocks[607] = 2; blocks[608] = 1; blocks[609] = 1; blocks[610] = 0; blocks[611] = 3; blocks[612] = 1; blocks[701] = 1; blocks[702] = 3; blocks[703] = 0; blocks[704] = 1; blocks[705] = 1; blocks[706] = 2; blocks[707] = 2; blocks[708] = 1; blocks[709] = 1; blocks[710] = 0; blocks[711] = 0; blocks[712] = 1; blocks[801] = 1; blocks[802] = 0; blocks[803] = 0; blocks[804] = 3; blocks[805] = 1; blocks[806] = 1; blocks[807] = 1; blocks[808] = 1; blocks[809] = 0; blocks[810] = 0; blocks[811] = 3; blocks[812] = 1; blocks[901] = 1; blocks[902] = 0; blocks[903] = 0; blocks[904] = 0; blocks[905] = 3; blocks[906] = 1; blocks[907] = 1; blocks[908] = 0; blocks[909] = 3; blocks[910] = 0; blocks[911] = 1; blocks[912] = 1; blocks[1001] = 1; blocks[1002] = 0; blocks[1003] = 3; blocks[1004] = 0; blocks[1005] = 0; blocks[1006] = 0; blocks[1007] = 0; blocks[1008] = 0; blocks[1009] = 0; blocks[1010] = 1; blocks[1011] = 1; blocks[1012] = 1; blocks[1101] = 0; blocks[1102] = 0; blocks[1103] = 0; blocks[1104] = 0; blocks[1105] = 0; blocks[1106] = 3; blocks[1107] = 0; blocks[1108] = 3; blocks[1109] = 1; blocks[1110] = 1; blocks[1111] = 1; blocks[1112] = 1; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 1; blocks[1204] = 1; blocks[1205] = 1; blocks[1206] = 1; blocks[1207] = 1; blocks[1208] = 1; blocks[1209] = 1; blocks[1210] = 1; blocks[1211] = 1; blocks[1212] = 1;
		} else if (map === 12) {
			blocks[101] = 0; blocks[102] = 0; blocks[103] = 3; blocks[104] = 2; blocks[105] = 3; blocks[106] = 2; blocks[107] = 2; blocks[108] = 3; blocks[109] = 2; blocks[110] = 3; blocks[111] = 0; blocks[112] = 0; blocks[201] = 0; blocks[202] = 2; blocks[203] = 3; blocks[204] = 3; blocks[205] = 3; blocks[206] = 3; blocks[207] = 3; blocks[208] = 3; blocks[209] = 3; blocks[210] = 3; blocks[211] = 2; blocks[212] = 0; blocks[301] = 3; blocks[302] = 3; blocks[303] = 3; blocks[304] = 2; blocks[305] = 3; blocks[306] = 2; blocks[307] = 2; blocks[308] = 3; blocks[309] = 2; blocks[310] = 3; blocks[311] = 3; blocks[312] = 3; blocks[401] = 2; blocks[402] = 3; blocks[403] = 2; blocks[404] = 3; blocks[405] = 2; blocks[406] = 3; blocks[407] = 3; blocks[408] = 2; blocks[409] = 3; blocks[410] = 2; blocks[411] = 3; blocks[412] = 2; blocks[501] = 3; blocks[502] = 3; blocks[503] = 3; blocks[504] = 2; blocks[505] = 3; blocks[506] = 2; blocks[507] = 2; blocks[508] = 3; blocks[509] = 2; blocks[510] = 3; blocks[511] = 3; blocks[512] = 3; blocks[601] = 2; blocks[602] = 3; blocks[603] = 2; blocks[604] = 3; blocks[605] = 2; blocks[606] = 1; blocks[607] = 1; blocks[608] = 2; blocks[609] = 3; blocks[610] = 2; blocks[611] = 3; blocks[612] = 2; blocks[701] = 2; blocks[702] = 3; blocks[703] = 2; blocks[704] = 3; blocks[705] = 2; blocks[706] = 1; blocks[707] = 1; blocks[708] = 2; blocks[709] = 3; blocks[710] = 2; blocks[711] = 3; blocks[712] = 2; blocks[801] = 3; blocks[802] = 3; blocks[803] = 3; blocks[804] = 2; blocks[805] = 3; blocks[806] = 2; blocks[807] = 2; blocks[808] = 3; blocks[809] = 2; blocks[810] = 3; blocks[811] = 3; blocks[812] = 3; blocks[901] = 2; blocks[902] = 3; blocks[903] = 2; blocks[904] = 3; blocks[905] = 2; blocks[906] = 3; blocks[907] = 3; blocks[908] = 2; blocks[909] = 3; blocks[910] = 2; blocks[911] = 3; blocks[912] = 2; blocks[1001] = 3; blocks[1002] = 3; blocks[1003] = 3; blocks[1004] = 2; blocks[1005] = 3; blocks[1006] = 2; blocks[1007] = 2; blocks[1008] = 3; blocks[1009] = 2; blocks[1010] = 3; blocks[1011] = 3; blocks[1012] = 3; blocks[1101] = 0; blocks[1102] = 2; blocks[1103] = 3; blocks[1104] = 3; blocks[1105] = 3; blocks[1106] = 3; blocks[1107] = 3; blocks[1108] = 3; blocks[1109] = 3; blocks[1110] = 3; blocks[1111] = 2; blocks[1112] = 0; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 3; blocks[1204] = 2; blocks[1205] = 3; blocks[1206] = 2; blocks[1207] = 2; blocks[1208] = 3; blocks[1209] = 2; blocks[1210] = 3; blocks[1211] = 0; blocks[1212] = 0;
		} else if (map === 13) {
			blocks[101] = 2; blocks[102] = 3; blocks[103] = 3; blocks[104] = 3; blocks[105] = 3; blocks[106] = 3; blocks[107] = 3; blocks[108] = 3; blocks[109] = 3; blocks[110] = 3; blocks[111] = 0; blocks[112] = 0; blocks[201] = 3; blocks[202] = 3; blocks[203] = 3; blocks[204] = 3; blocks[205] = 2; blocks[206] = 3; blocks[207] = 3; blocks[208] = 3; blocks[209] = 3; blocks[210] = 0; blocks[211] = 2; blocks[212] = 0; blocks[301] = 3; blocks[302] = 3; blocks[303] = 3; blocks[304] = 3; blocks[305] = 3; blocks[306] = 3; blocks[307] = 3; blocks[308] = 3; blocks[309] = 0; blocks[310] = 0; blocks[311] = 0; blocks[312] = 3; blocks[401] = 3; blocks[402] = 3; blocks[403] = 3; blocks[404] = 3; blocks[405] = 3; blocks[406] = 3; blocks[407] = 3; blocks[408] = 0; blocks[409] = 0; blocks[410] = 0; blocks[411] = 3; blocks[412] = 3; blocks[501] = 3; blocks[502] = 2; blocks[503] = 3; blocks[504] = 3; blocks[505] = 3; blocks[506] = 3; blocks[507] = 0; blocks[508] = 0; blocks[509] = 0; blocks[510] = 3; blocks[511] = 3; blocks[512] = 3; blocks[601] = 3; blocks[602] = 3; blocks[603] = 3; blocks[604] = 3; blocks[605] = 3; blocks[606] = 0; blocks[607] = 0; blocks[608] = 0; blocks[609] = 3; blocks[610] = 3; blocks[611] = 3; blocks[612] = 3; blocks[701] = 3; blocks[702] = 3; blocks[703] = 3; blocks[704] = 3; blocks[705] = 0; blocks[706] = 0; blocks[707] = 0; blocks[708] = 3; blocks[709] = 3; blocks[710] = 3; blocks[711] = 3; blocks[712] = 3; blocks[801] = 3; blocks[802] = 3; blocks[803] = 3; blocks[804] = 0; blocks[805] = 0; blocks[806] = 0; blocks[807] = 3; blocks[808] = 3; blocks[809] = 3; blocks[810] = 3; blocks[811] = 2; blocks[812] = 3; blocks[901] = 3; blocks[902] = 3; blocks[903] = 0; blocks[904] = 0; blocks[905] = 0; blocks[906] = 3; blocks[907] = 3; blocks[908] = 3; blocks[909] = 3; blocks[910] = 3; blocks[911] = 3; blocks[912] = 3; blocks[1001] = 3; blocks[1002] = 0; blocks[1003] = 0; blocks[1004] = 0; blocks[1005] = 3; blocks[1006] = 3; blocks[1007] = 3; blocks[1008] = 3; blocks[1009] = 3; blocks[1010] = 3; blocks[1011] = 3; blocks[1012] = 3; blocks[1101] = 0; blocks[1102] = 2; blocks[1103] = 0; blocks[1104] = 3; blocks[1105] = 3; blocks[1106] = 3; blocks[1107] = 3; blocks[1108] = 2; blocks[1109] = 3; blocks[1110] = 3; blocks[1111] = 3; blocks[1112] = 3; blocks[1201] = 0; blocks[1202] = 0; blocks[1203] = 3; blocks[1204] = 3; blocks[1205] = 3; blocks[1206] = 3; blocks[1207] = 3; blocks[1208] = 3; blocks[1209] = 3; blocks[1210] = 3; blocks[1211] = 3; blocks[1212] = 2;
		}

		for (var i = 0; i < 13; i++) {
			for (var j = 0; j < 13; j++) {
				block[i * 100 + j] = new lib.blocks();
				block[i * 100 + j].x = i * 50 - 25;
				block[i * 100 + j].y = j * 50 - 25;
				if (blocks[i * 100 + j] === 0) {
					block[i * 100 + j].gotoAndPlay("air");
				} else if (blocks[i * 100 + j] === 1) {
					block[i * 100 + j].gotoAndPlay("wall");
				} else if (blocks[i * 100 + j] === 2) {
					block[i * 100 + j].gotoAndPlay("gold");
					gold_count++;
				} else if (blocks[i * 100 + j] === 3) {
					block[i * 100 + j].gotoAndPlay("tree");
				} else {
					block[i * 100 + j].gotoAndPlay("air");
				}
				exportRoot.addChild(block[i * 100 + j]);
			}
		}
	}

	//手機板
	function touchdownMove(e) {
		//console.log(e.keyCode);

		if (end) return reset();

		//Player1

		if (!canplay) return;

		if (e === 37) {
			udlr = true;
			step = STEP * -1;
			isKeyDown = true;
			robot.gotoAndPlay("left");
			if (blocks[(player1_x - 1) * 100 + (player1_y)] > 0 || player1_x === 1) return;
			moveFn();
		} else if (e === 38) {
			udlr = false;
			step = STEP * -1;
			isKeyDown = true;
			robot.gotoAndPlay("up");
			if (blocks[(player1_x) * 100 + (player1_y - 1)] > 0 || player1_y === 1) return;
			moveFn();
		} else if (e === 39) {
			udlr = true;
			step = STEP;
			isKeyDown = true;
			robot.gotoAndPlay("right");
			if (blocks[(player1_x + 1) * 100 + (player1_y)] > 0 || player1_x === 12) return;
			moveFn();
		} else if (e === 40) {
			udlr = false;
			step = STEP;
			isKeyDown = true;
			robot.gotoAndPlay("down");
			if (blocks[(player1_x) * 100 + (player1_y + 1)] > 0 || player1_y === 12) return;
			moveFn();
		} else if (e === 191 && blocks[(player1_x) * 100 + (player1_y)] === 0) {
			var tnt = new lib.tnt();
			tnt.x = robot.x;
			tnt.y = robot.y;
			let data = [];
			data.push((player1_x) * 100 + (player1_y));
			blocks[(player1_x) * 100 + (player1_y)] = 4;
			tnt.gotoAndPlay("shing");
			exportRoot.addChildAt(tnt, 0);
			createjs.Sound.play("fuse");
			setTimeout(function () {
				let location = data.shift();
				tnt.gotoAndPlay("explore");
				blocks[location] = 0;
				createjs.Sound.play(explore_sound());
				setTimeout(function () { exportRoot.removeChild(tnt); }, 500);
				let u = location - 1;
				let d = location + 1;
				let l = location - 100;
				let r = location + 100;
				if (blocks[u] > 1 && blocks[u] < 4) {
					block[u].gotoAndPlay("air");
					if (blocks[u] === 2) score1++;
					blocks[u] = 0;

				}
				if (blocks[d] > 1 && blocks[d] < 4) {
					block[d].gotoAndPlay("air");
					if (blocks[d] === 2) score1++;
					blocks[d] = 0;

				}
				if (blocks[l] > 1 && blocks[l] < 4) {
					block[l].gotoAndPlay("air");
					if (blocks[l] === 2) score1++;
					blocks[l] = 0;

				}
				if (blocks[r] > 1 && blocks[r] < 4) {
					block[r].gotoAndPlay("air");
					if (blocks[r] === 2) score1++;
					blocks[r] = 0;

				}
				document.querySelector(".p1score").innerHTML = score1;
				if (location === (player1_x) * 100 + (player1_y)) p1die++;
				if (location === (player2_x) * 100 + (player2_y)) p2die++;
				if (u === (player1_x) * 100 + (player1_y)) p1die++;
				if (u === (player2_x) * 100 + (player2_y)) p2die++;
				if (d === (player1_x) * 100 + (player1_y)) p1die++;
				if (d === (player2_x) * 100 + (player2_y)) p2die++;
				if (l === (player1_x) * 100 + (player1_y)) p1die++;
				if (l === (player2_x) * 100 + (player2_y)) p2die++;
				if (r === (player1_x) * 100 + (player1_y)) p1die++;
				if (r === (player2_x) * 100 + (player2_y)) p2die++;
				die_detect();
			}, 2500);

		}

		//Player2
		if (e === 65) {
			udlr2 = true;
			step2 = STEP * -1;
			isKeyDown = true;
			robot2.gotoAndPlay("left");
			if (blocks[(player2_x - 1) * 100 + (player2_y)] > 0 || player2_x === 1) return;
			moveFn2();
		} else if (e === 87) {
			udlr2 = false;
			step2 = STEP * -1;
			isKeyDown = true;
			robot2.gotoAndPlay("up");
			if (blocks[(player2_x) * 100 + (player2_y - 1)] > 0 || player2_y === 1) return;
			moveFn2();
		} else if (e === 68) {
			udlr2 = true;
			step2 = STEP;
			isKeyDown = true;
			robot2.gotoAndPlay("right");
			if (blocks[(player2_x + 1) * 100 + (player2_y)] > 0 || player2_x === 12) return;
			moveFn2();
		} else if (e === 83) {
			udlr2 = false;
			step2 = STEP;
			isKeyDown = true;
			robot2.gotoAndPlay("down");
			if (blocks[(player2_x) * 100 + (player2_y + 1)] > 0 || player2_y === 12) return;
			moveFn2();
		} else if (e === 71 && blocks[(player2_x) * 100 + (player2_y)] === 0) {
			var tnt2 = new lib.tnt();
			tnt2.x = robot2.x;
			tnt2.y = robot2.y;
			let data2 = [];
			data2.push((player2_x) * 100 + (player2_y));
			blocks[(player2_x) * 100 + (player2_y)] = 4;
			tnt2.gotoAndPlay("shing");
			exportRoot.addChildAt(tnt2, 0);
			createjs.Sound.play("fuse");
			setTimeout(function () {
				let location2 = data2.shift();
				tnt2.gotoAndPlay("explore");
				blocks[location2] = 0;
				setTimeout(function () { exportRoot.removeChild(tnt2); }, 500);
				createjs.Sound.play(explore_sound());
				let u2 = location2 - 1;
				let d2 = location2 + 1;
				let l2 = location2 - 100;
				let r2 = location2 + 100;
				if (blocks[u2] > 1 && blocks[u2] < 4) {
					block[u2].gotoAndPlay("air");
					if (blocks[u2] === 2) score2++;
					blocks[u2] = 0;
				}
				if (blocks[d2] > 1 && blocks[d2] < 4) {
					block[d2].gotoAndPlay("air");
					if (blocks[d2] === 2) score2++;
					blocks[d2] = 0;
				}
				if (blocks[l2] > 1 && blocks[l2] < 4) {
					block[l2].gotoAndPlay("air");
					if (blocks[l2] === 2) score2++;
					blocks[l2] = 0;
				}
				if (blocks[r2] > 1 && blocks[r2] < 4) {
					block[r2].gotoAndPlay("air");
					if (blocks[r2] === 2) score2++;
					blocks[r2] = 0;
				}
				document.querySelector(".p2score").innerHTML = score2;
				if (location2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (location2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (u2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (u2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (d2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (d2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (l2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (l2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (r2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (r2 === (player2_x) * 100 + (player2_y)) p2die++;
				die_detect();

			}, 2500);

		}
		document.querySelector(".left1").onclick = null;
		document.querySelector(".up1").onclick = null;
		document.querySelector(".right1").onclick = null;
		document.querySelector(".down1").onclick = null;
		document.querySelector(".tnt1").onclick = null;
		document.querySelector(".left2").onclick = null;
		document.querySelector(".up2").onclick = null;
		document.querySelector(".right2").onclick = null;
		document.querySelector(".down2").onclick = null;
		document.querySelector(".tnt2").onclick = null;

	}

	function explore_sound() {
		let exp = Math.floor(Math.random() * (4 - 1 + 1) + 1);
		if (exp === 1) return "exp1";
		if (exp === 2) return "exp2";
		if (exp === 3) return "exp3";
		if (exp === 4) return "exp4";
	}


	//左上右下37~40
	function keydownMoveFn(e) {
		//console.log(e.keyCode);
		if (end) return reset();
		//Player1

		if (!canplay) return;

		if (e.keyCode === 37) {
			udlr = true;
			step = STEP * -1;
			isKeyDown = true;
			robot.gotoAndPlay("left");
			if (blocks[(player1_x - 1) * 100 + (player1_y)] > 0 || player1_x === 1) return;
			moveFn();
		} else if (e.keyCode === 38) {
			udlr = false;
			step = STEP * -1;
			isKeyDown = true;
			robot.gotoAndPlay("up");
			if (blocks[(player1_x) * 100 + (player1_y - 1)] > 0 || player1_y === 1) return;
			moveFn();
		} else if (e.keyCode === 39) {
			udlr = true;
			step = STEP;
			isKeyDown = true;
			robot.gotoAndPlay("right");
			if (blocks[(player1_x + 1) * 100 + (player1_y)] > 0 || player1_x === 12) return;
			moveFn();
		} else if (e.keyCode === 40) {
			udlr = false;
			step = STEP;
			isKeyDown = true;
			robot.gotoAndPlay("down");
			if (blocks[(player1_x) * 100 + (player1_y + 1)] > 0 || player1_y === 12) return;
			moveFn();
		} else if (e.keyCode === 191 && blocks[(player1_x) * 100 + (player1_y)] === 0) {
			var tnt = new lib.tnt();
			tnt.x = robot.x;
			tnt.y = robot.y;
			let data = [];
			data.push((player1_x) * 100 + (player1_y));
			blocks[(player1_x) * 100 + (player1_y)] = 4;
			tnt.gotoAndPlay("shing");
			exportRoot.addChildAt(tnt, 0);
			createjs.Sound.play("fuse");
			setTimeout(function () {
				let location = data.shift();
				tnt.gotoAndPlay("explore");
				blocks[location] = 0;
				createjs.Sound.play(explore_sound());
				setTimeout(function () { exportRoot.removeChild(tnt); }, 500);
				let u = location - 1;
				let d = location + 1;
				let l = location - 100;
				let r = location + 100;
				if (blocks[u] > 1 && blocks[u] < 4) {
					block[u].gotoAndPlay("air");
					if (blocks[u] === 2) score1++;
					blocks[u] = 0;

				}
				if (blocks[d] > 1 && blocks[d] < 4) {
					block[d].gotoAndPlay("air");
					if (blocks[d] === 2) score1++;
					blocks[d] = 0;

				}
				if (blocks[l] > 1 && blocks[l] < 4) {
					block[l].gotoAndPlay("air");
					if (blocks[l] === 2) score1++;
					blocks[l] = 0;

				}
				if (blocks[r] > 1 && blocks[r] < 4) {
					block[r].gotoAndPlay("air");
					if (blocks[r] === 2) score1++;
					blocks[r] = 0;

				}
				document.querySelector(".p1score").innerHTML = score1;
				if (location === (player1_x) * 100 + (player1_y)) p1die++;
				if (location === (player2_x) * 100 + (player2_y)) p2die++;
				if (u === (player1_x) * 100 + (player1_y)) p1die++;
				if (u === (player2_x) * 100 + (player2_y)) p2die++;
				if (d === (player1_x) * 100 + (player1_y)) p1die++;
				if (d === (player2_x) * 100 + (player2_y)) p2die++;
				if (l === (player1_x) * 100 + (player1_y)) p1die++;
				if (l === (player2_x) * 100 + (player2_y)) p2die++;
				if (r === (player1_x) * 100 + (player1_y)) p1die++;
				if (r === (player2_x) * 100 + (player2_y)) p2die++;
				die_detect();
			}, 2500);

		}

		//Player2
		if (e.keyCode === 65) {
			udlr2 = true;
			step2 = STEP * -1;
			isKeyDown = true;
			robot2.gotoAndPlay("left");
			if (blocks[(player2_x - 1) * 100 + (player2_y)] > 0 || player2_x === 1) return;
			moveFn2();
		} else if (e.keyCode === 87) {
			udlr2 = false;
			step2 = STEP * -1;
			isKeyDown = true;
			robot2.gotoAndPlay("up");
			if (blocks[(player2_x) * 100 + (player2_y - 1)] > 0 || player2_y === 1) return;
			moveFn2();
		} else if (e.keyCode === 68) {
			udlr2 = true;
			step2 = STEP;
			isKeyDown = true;
			robot2.gotoAndPlay("right");
			if (blocks[(player2_x + 1) * 100 + (player2_y)] > 0 || player2_x === 12) return;
			moveFn2();
		} else if (e.keyCode === 83) {
			udlr2 = false;
			step2 = STEP;
			isKeyDown = true;
			robot2.gotoAndPlay("down");
			if (blocks[(player2_x) * 100 + (player2_y + 1)] > 0 || player2_y === 12) return;
			moveFn2();
		} else if (e.keyCode === 71 && blocks[(player2_x) * 100 + (player2_y)] === 0) {
			var tnt2 = new lib.tnt();
			tnt2.x = robot2.x;
			tnt2.y = robot2.y;
			let data2 = [];
			data2.push((player2_x) * 100 + (player2_y));
			blocks[(player2_x) * 100 + (player2_y)] = 4;
			tnt2.gotoAndPlay("shing");
			exportRoot.addChildAt(tnt2, 0);
			createjs.Sound.play("fuse");
			setTimeout(function () {
				let location2 = data2.shift();
				tnt2.gotoAndPlay("explore");
				blocks[location2] = 0;
				createjs.Sound.play(explore_sound());
				setTimeout(function () { exportRoot.removeChild(tnt2); }, 500);
				let u2 = location2 - 1;
				let d2 = location2 + 1;
				let l2 = location2 - 100;
				let r2 = location2 + 100;
				if (blocks[u2] > 1 && blocks[u2] < 4) {
					block[u2].gotoAndPlay("air");
					if (blocks[u2] === 2) score2++;
					blocks[u2] = 0;
				}
				if (blocks[d2] > 1 && blocks[d2] < 4) {
					block[d2].gotoAndPlay("air");
					if (blocks[d2] === 2) score2++;
					blocks[d2] = 0;
				}
				if (blocks[l2] > 1 && blocks[l2] < 4) {
					block[l2].gotoAndPlay("air");
					if (blocks[l2] === 2) score2++;
					blocks[l2] = 0;
				}
				if (blocks[r2] > 1 && blocks[r2] < 4) {
					block[r2].gotoAndPlay("air");
					if (blocks[r2] === 2) score2++;
					blocks[r2] = 0;
				}
				document.querySelector(".p2score").innerHTML = score2;
				if (location2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (location2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (u2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (u2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (d2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (d2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (l2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (l2 === (player2_x) * 100 + (player2_y)) p2die++;
				if (r2 === (player1_x) * 100 + (player1_y)) p1die++;
				if (r2 === (player2_x) * 100 + (player2_y)) p2die++;
				die_detect();

			}, 2500);

		}

	}

	function keyupMoveFn(e) {
		isKeyDown = false;
	}

	//createjs.Ticker.addEventListener("tick", tickFn)
	function moveFn() {

		if (!isKeyDown) return;
		if (udlr) {
			player1_x += step / 50
			robot.x += step;
		} else {
			player1_y += step / 50
			robot.y += step;
		}
		//console.log("("+player1_x+","+player1_y+")");
	}
	function moveFn2() {

		if (!isKeyDown) return;
		if (udlr2) {
			player2_x += step2 / 50
			robot2.x += step2;
		} else {
			player2_y += step2 / 50
			robot2.y += step2;
		}
		//console.log("(" + player2_x + "," + player2_y + ")");
	}

	function die_detect() {
		if (!canplay) return;
		if (p1die && p2die) {
			if (gold_count === score1 + score2) {
				if (score1 - score2 === 0) {
					canplay = false;
					document.getElementById("win").classList.remove("win");
					document.getElementById("win").innerHTML = "WTF?"
					document.getElementById("win").classList.add("drew");
				} else if (score1 - score2 > 0) {
					canplay = false;
					document.getElementById("win").classList.remove("win");
					document.getElementById("win").classList.add("p1win");
				} else {
					canplay = false;
					document.getElementById("win").classList.remove("win");
					document.getElementById("win").classList.add("p2win");
				}
				end_detect();
				return;
			}
			canplay = false;
			robot.gotoAndPlay("explore");
			robot2.gotoAndPlay("explore");
			document.getElementById("win").classList.remove("win");
			document.getElementById("win").innerHTML = "drew"
			document.getElementById("win").classList.add("drew");
			end_detect();
			return;
		} else if (p1die) {
			canplay = false;
			robot.gotoAndPlay("explore");
			document.getElementById("win").classList.remove("win");
			document.getElementById("win").classList.add("p2win");
			end_detect();
			return;
		} else if (p2die) {
			canplay = false;
			robot2.gotoAndPlay("explore");
			document.getElementById("win").classList.remove("win");
			document.getElementById("win").classList.add("p1win");
			end_detect();
			return;
		}
		if (gold_count === score1 + score2) {
			if (score1 - score2 === 0) {
				canplay = false;
				document.getElementById("win").classList.remove("win");
				document.getElementById("win").innerHTML = "drew"
				document.getElementById("win").classList.add("drew");
			} else if (score1 - score2 > 0) {
				canplay = false;
				document.getElementById("win").classList.remove("win");
				document.getElementById("win").classList.add("p1win");
			} else {
				canplay = false;
				document.getElementById("win").classList.remove("win");
				document.getElementById("win").classList.add("p2win");
			}
			end_detect();
		}


	}
	function end_detect() {
		if (!canplay) {
			document.getElementById("reload_back").innerHTML = "按任意鍵重置遊戲";
		document.getElementById("reload").innerHTML = "按任意鍵重置遊戲";
			document.getElementById("reload_back").style.display = "block";
			document.getElementById("reload").style.display = "block";
			end = true;
			bgAudio.stop();
		}
	}















	//Registers the "tick" event listener.
	fnStartAnimation = function () {
		stage.addChild(exportRoot);
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage)
		stage.addEventListener("tick", handleTick)
		function getProjectionMatrix(container, totalDepth) {
			var focalLength = 528.25;
			var projectionCenter = { x: lib.properties.width / 2, y: lib.properties.height / 2 };
			var scale = (totalDepth + focalLength) / focalLength;
			var scaleMat = new createjs.Matrix2D;
			scaleMat.a = 1 / scale;
			scaleMat.d = 1 / scale;
			var projMat = new createjs.Matrix2D;
			projMat.tx = -projectionCenter.x;
			projMat.ty = -projectionCenter.y;
			projMat = projMat.prependMatrix(scaleMat);
			projMat.tx += projectionCenter.x;
			projMat.ty += projectionCenter.y;
			return projMat;
		}
		function handleTick(event) {
			var cameraInstance = exportRoot.___camera___instance;
			if (cameraInstance !== undefined && cameraInstance.pinToObject !== undefined) {
				cameraInstance.x = cameraInstance.pinToObject.x + cameraInstance.pinToObject.pinOffsetX;
				cameraInstance.y = cameraInstance.pinToObject.y + cameraInstance.pinToObject.pinOffsetY;
				if (cameraInstance.pinToObject.parent !== undefined && cameraInstance.pinToObject.parent.depth !== undefined)
					cameraInstance.depth = cameraInstance.pinToObject.parent.depth + cameraInstance.pinToObject.pinOffsetZ;
			}
			applyLayerZDepth(exportRoot);
		}
		function applyLayerZDepth(parent) {
			var cameraInstance = parent.___camera___instance;
			var focalLength = 528.25;
			var projectionCenter = { 'x': 0, 'y': 0 };
			if (parent === exportRoot) {
				var stageCenter = { 'x': lib.properties.width / 2, 'y': lib.properties.height / 2 };
				projectionCenter.x = stageCenter.x;
				projectionCenter.y = stageCenter.y;
			}
			for (child in parent.children) {
				var layerObj = parent.children[child];
				if (layerObj == cameraInstance)
					continue;
				applyLayerZDepth(layerObj, cameraInstance);
				if (layerObj.layerDepth === undefined)
					continue;
				if (layerObj.currentFrame != layerObj.parent.currentFrame) {
					layerObj.gotoAndPlay(layerObj.parent.currentFrame);
				}
				var matToApply = new createjs.Matrix2D;
				var cameraMat = new createjs.Matrix2D;
				var totalDepth = layerObj.layerDepth ? layerObj.layerDepth : 0;
				var cameraDepth = 0;
				if (cameraInstance && !layerObj.isAttachedToCamera) {
					var mat = cameraInstance.getMatrix();
					mat.tx -= projectionCenter.x;
					mat.ty -= projectionCenter.y;
					cameraMat = mat.invert();
					cameraMat.prependTransform(projectionCenter.x, projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
					cameraMat.appendTransform(-projectionCenter.x, -projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
					if (cameraInstance.depth)
						cameraDepth = cameraInstance.depth;
				}
				if (layerObj.depth) {
					totalDepth = layerObj.depth;
				}
				//Offset by camera depth
				totalDepth -= cameraDepth;
				if (totalDepth < -focalLength) {
					matToApply.a = 0;
					matToApply.d = 0;
				}
				else {
					if (layerObj.layerDepth) {
						var sizeLockedMat = getProjectionMatrix(parent, layerObj.layerDepth);
						if (sizeLockedMat) {
							sizeLockedMat.invert();
							matToApply.prependMatrix(sizeLockedMat);
						}
					}
					matToApply.prependMatrix(cameraMat);
					var projMat = getProjectionMatrix(parent, totalDepth);
					if (projMat) {
						matToApply.prependMatrix(projMat);
					}
				}
				layerObj.transformMatrix = matToApply;
			}
		}
	}
	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {
		var lastW, lastH, lastS = 1;
		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		function resizeCanvas() {
			var w = lib.properties.width, h = lib.properties.height;
			var iw = window.innerWidth, ih = window.innerHeight;
			var pRatio = window.devicePixelRatio || 1, xRatio = iw / w, yRatio = ih / h, sRatio = 1;
			if (isResp) {
				if ((respDim == 'width' && lastW == iw) || (respDim == 'height' && lastH == ih)) {
					sRatio = lastS;
				}
				else if (!isScale) {
					if (iw < w || ih < h)
						sRatio = Math.min(xRatio, yRatio);
				}
				else if (scaleType == 1) {
					sRatio = Math.min(xRatio, yRatio);
				}
				else if (scaleType == 2) {
					sRatio = Math.max(xRatio, yRatio);
				}
			}
			canvas.width = w * pRatio * sRatio;
			canvas.height = h * pRatio * sRatio;
			canvas.style.width = dom_overlay_container.style.width = anim_container.style.width = w * sRatio + 'px';
			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h * sRatio + 'px';
			stage.scaleX = pRatio * sRatio;
			stage.scaleY = pRatio * sRatio;
			lastW = iw; lastH = ih; lastS = sRatio;
			stage.tickOnUpdate = false;
			stage.update();
			stage.tickOnUpdate = true;
		}
	}
	makeResponsive(false, 'both', false, 1);
	AdobeAn.compositionLoaded(lib.properties.id);
	fnStartAnimation();
}