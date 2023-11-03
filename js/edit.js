
let el = {};
let tempObjects;

let currentFocus = "";
let currentText;
let currentWidth;
let currentHeight;
let currentWritingMode;

let isResizing = false;
let isRotate = false;
let isMove = true;

let deletePointDom;
let clickedId

let clickedDom;

/**
 * ドラッグ移動アニメーション
 */
function mousedown(e) {
	// debugger;
	//移動時にmousemove、離れた時にmouseup関数を実行する
	window.addEventListener("mousemove", mousemove);
	window.addEventListener("mouseup", mouseup);

	//現在地を取得
	let prevX = e.clientX;
	let prevY = e.clientY;

	clickedId = getId(e, "id");

	// mousemoveされたとき
	function mousemove(e) {

		// リサイズが行われていない場合
		if (!isRotate && !isResizing && isMove) {
			// X,Y座標値差 = 初期値 - 現在地点
			let newX = prevX - e.clientX;
			let newY = prevY - e.clientY;

			// 現在地点を変数として取得
			const rect = el[clickedId].moveElem.getBoundingClientRect();

			el[clickedId].moveElem.style.left = rect.left - newX + "px";
			el[clickedId].moveElem.style.top = rect.top - newY + "px";

			// top left位置を再設定
			el[clickedId].moveElem.style.left = rect.left - newX + "px";
			el[clickedId].moveElem.style.top = rect.top - newY + "px";

			// console.log(newX);
			prevX = e.clientX;
			prevY = e.clientY;

		}
	}

	// itemからカーソルが離れた際にイベントを解除
	function mouseup() {
		window.removeEventListener("mousemove", mousemove);
		window.removeEventListener("mouseup", mouseup);
	}
}

/**
 *  resizeアニメーション
 */
function mousedownResize(e) {
	fitty('.fit', {
		minSize: 12,
		maxSize: 100,
	});

	clickedId = getId(e, "id");

	const getRect = el[clickedId].moveElem.getBoundingClientRect();
	const heightRatios = getRect.height / getRect.width;

	// リサイズを行う際の要素(resizer)を指定
	// リサイズを許可し、draggableアニメーションの発動をさせない
	currentResizer = e.target;
	isResizing = true;

	//　クリック時のカーソル座標を取得
	let prevX = e.clientX;

	//  mousemove mouseupイベントそれぞれを指定要素に付加
	window.addEventListener("mousemove", mousemoveResize);
	window.addEventListener("mouseup", mouseupResize);

	//  mousemoveイベント
	function mousemoveResize(e) {
		// 要素の相対位置を取得
		const rect = el[clickedId].moveElem.getBoundingClientRect();

		const calcHeight = (rect.width - (prevX - e.clientX)) * heightRatios;

		change_size = 0;
		// 指定要素に付加されているクラス名に応じて処理を変える　
		if (currentResizer.classList.contains("resizer-br")) {
			// 右下
			// 幅or高さ　-　(クリック時の座標-現在のカーソル位置)
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
		} else if (currentResizer.classList.contains("resizer-bl")) {
			// 左下
			// 要素のleft値の変更を行わなければならない
			el[clickedId].moveElem.style.width = rect.width + (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
			el[clickedId].moveElem.style.left = rect.left - (prevX - e.clientX) + "px";
		} else if (currentResizer.classList.contains("resizer-cr")) {
			// 右中央
			// 要素のwidth値の変更を行わなければならない
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
		} else if (currentResizer.classList.contains("resizer-tr")) {
			// 右上
			// 要素のtop値の変更を行わなければならない
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
			rect = el[clickedId].moveElem.getBoundingClientRect();
			el[clickedId].moveElem.style.top = rect.top - (rect.bottom - getRect.bottom) + "px";
		} else {
			// 左上
			// 要素の幅、高さ、top値、 left値すべての変更を行う
			el[clickedId].moveElem.style.width = rect.width + (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
			rect = el[clickedId].moveElem.getBoundingClientRect();
			el[clickedId].moveElem.style.top = rect.top - Math.floor(rect.bottom - getRect.bottom) + "px";
			el[clickedId].moveElem.style.left = rect.left - (prevX - e.clientX) + "px";
		}

		fitty('.fit', {
			minSize: 12,
			maxSize: 100,
		});

		// 変更後のカーソル位置をprevに退避させる
		prevX = e.clientX;
		prevY = e.clientY;
	}

	//ボタンが外された場合Eventを除去
	function mouseupResize() {
		el[clickedId].moveElem.style.height = "fit-content";
		window.removeEventListener("mousemove", mousemoveResize);
		window.removeEventListener("mouseup", mouseupResize);
		isResizing = false;
	}
}

/**
 * 要素の回転アニメーション
 */
function mousedownRotate(e) {
	// debugger;
	window.addEventListener("mousemove", mousemoveRotate);
	window.addEventListener("mouseup", mouseupRotate);
	isRotate = true;

	const clickRotateId = getId(e, "rotate");

	const topRect = el[clickRotateId].rotateTopFixPoint.getBoundingClientRect();
	const centerRect = el[clickRotateId].rotateCenter.getBoundingClientRect();

	const topPosition = {
		x: topRect.top,
		y: topRect.left
	};

	// 要素の中心点
	const centerPosition = {
		x: centerRect.top,
		y: centerRect.left
	};

	// debugger
	// 現在地点を入力
	function mousemoveRotate(e) {
		// debugger;
		// 現在地点を(e.clientY, e.clientXとして取得)
		const prev = {
			x: e.clientY,
			y: e.clientX
		};
		// 各辺の長さ計算を行う
		const oppositeSide = Math.sqrt(((prev.x - topPosition.x) ** 2) + ((prev.y - topPosition.y) ** 2));
		const flankingSideFirst = Math.sqrt(((prev.x - centerPosition.x) ** 2) + ((prev.y - centerPosition.y) ** 2));
		const flankingSideSecond = Math.sqrt(((topPosition.x - centerPosition.x) ** 2) + ((topPosition.y - centerPosition.y) ** 2));

		// 余弦定理を用いてcosXを求める
		const cosX = (((flankingSideFirst ** 2) + (flankingSideSecond ** 2) - (oppositeSide ** 2)) / (2 * flankingSideFirst * flankingSideSecond));

		// 逆三角関数(arcCos)を用いて ラジアン値を求める
		const radian = Math.acos(cosX);

		// 角度に変換する
		let degree = radian * (180 / Math.PI);

		if (prev.y < centerPosition.y) {
			degree = 360 - degree;
		}

		if (0 < degree && degree < 10) {
			degree = 0
		}

		if (90 < degree && degree < 100) {
			degree = 90
		}

		if (180 < degree && degree < 190) {
			degree = 180
		}

		if (270 < degree && degree < 280) {
			degree = 270
		}
		el[clickRotateId].rotateContent.style.transform = `rotate(${degree}deg)`;

	}
	function mouseupRotate() {
		window.removeEventListener("mousemove", mousemoveRotate);
		window.removeEventListener("mouseup", mouseupRotate);
		isRotate = false;
	}

}

/**
 * 各セレクト要素を選択した場合の処理
 */
const selectOn = document.querySelectorAll(".select_content");

selectOn.forEach((elem) => {
	elem.addEventListener("click", (e) => {
		target = e.target.id;

		const onElem = document.getElementById(target);
		onElem.classList.remove("select_off")
		const offMainElem = document.querySelectorAll(`.main-temp-elem:not(#${target})`);
		const offElem = document.querySelectorAll(`.select_content:not(#${target})`);
		offElem.forEach((off) => {
			off.classList.add("select_off");
		});

		offMainElem.forEach((off) => {
			off.classList.add("off_t")
		});

		const onMainElem = document.querySelector(`.${target}`);
		onMainElem.classList.remove("off_t");
	});
});

/**
 * 画像選択による、背景画像の差し替え
 */
const url = ["harinezumi.PNG", "kingyo.PNG", "sc_mimai.PNG", "modan.png", "xmas.PNG", "kouyou.png", "sakura.png", "oiwai.png", "oiwai_1.png", "night.png"];
const insert_element = document.getElementById("data");
const select_img = document.querySelectorAll(".select-img-all");
let current_url = url[0];
select_img.forEach((img, index) => {
	img.addEventListener("click", () => {
		current_url = url[index];
		insert_element.style.backgroundImage = `url(./data/img_data/${url[index]})`;
	});
});

/**
 * 対象のDOMを右クリックした時のコンテキストメニュー表示アニメーション
 */
function view_context_menu() {
	document.querySelector(".context").addEventListener('contextmenu', function (e) {
		document.getElementById('contextmenu').style.left = e.pageX + "px";
		document.getElementById('contextmenu').style.top = e.pageY + "px";
		document.getElementById('contextmenu').style.display = "block";

		// クリックを行った要素のIDを取得
		let clickedId = getId(e, "id");

		// 削除対象としてデータを格納
		deletePointDom = clickedId;
	});

	document.body.addEventListener('click', function (e) {
		document.getElementById('contextmenu').style.display = "none";
	});
}

/**
 * 要素をダブルクリックすることでテキスト編集可能状態にする
 * @param e event
 */
function set_Editable(e) {
	// ドラッグ移動イベントを実行不可の状態にする
	isMove = false;
	let clickedId = getId(e, "id");

	// 選択した要素のIDを更新
	currentFocus = clickedId;
	currentText = $(`#${currentFocus}`).find(".text");

	// headerの各編集項目の更新を行うために対象のstyleを取得
	let currentOption = currentText.css("fontFamily");
	let currentMode = currentText.css("writingMode");
	let currentColor = currentText.css("color");

	// horizontal-tbの場合は一旦unsetに変更
	if (currentMode == "horizontal-tb") {
		currentMode = "unset";
	}

	// 各編集項目の更新
	pickr.setColor(currentColor);
	$("#fontFamily").val(currentOption);
	$("#writingMode").val(currentMode);
	$("#now_elem").text(currentText.text());

	// テキストを編集可能状態に変更
	el[clickedId].editText.contentEditable = "true";
}

/**
 * フォーカスを外した際に、テキストを非編集状態にする
 * @param e event
 */
function set_Uneditable(e) {
	// ドラッグ移動イベントを実行可能状態にする
	isMove = true;
	let clickedId = getId(e, "id");

	currentText = $(`#${currentFocus}`).find(".text");
	$("#now_elem").text(currentText.text());

	// テキストを実行不可状態に変更
	el[clickedId].editText.contentEditable = "false";
}

/**
 * 指定した要素のidを取得する関数
 * @param event 指定要素のevent引数
 * @param {string} specifiedKey datasetの参照キー
 * @returns 指定要素のid
 */
function getId(event, specifiedKey) {
	clickedDom = event.composedPath();
	return clickedDom[0].dataset[specifiedKey];
}


const onEdit = document.getElementById("edit_on");
const offEdit = document.getElementById("edit_off");

// 要素を編集モードにする
onEdit.addEventListener("click", change_edit);

function change_edit() {
	// debugger;
	offEdit.classList.remove("tgl_on");
	onEdit.classList.add("tgl_on");
	const blockElem = document.querySelectorAll(".on_n");
	const visibleElem = document.querySelectorAll(".on_h");
	blockElem.forEach((elem) => {
		elem.style.display = "block";
	});
	visibleElem.forEach((elem) => {
		elem.style.border = "solid 1px #000";
	});
	$(".now-elem, .fontFamilys, .writtingModes").css("visibility", "visible");
	$(".color-picker").css("display", "block");
	$(".mypage, .top").css("display", "none");
}


// 要素を調整・閲覧モードにする
offEdit.addEventListener("click", change_preview);

function change_preview() {
	onEdit.classList.remove("tgl_on");
	offEdit.classList.add("tgl_on");
	const noneElem = document.querySelectorAll(".on_n");
	const hiddenElem = document.querySelectorAll(".on_h");
	noneElem.forEach((elem) => {
		elem.style.display = "none";
	});
	hiddenElem.forEach((elem) => {
		elem.style.border = "none";
	});
	$(".now-elem, .fontFamilys, .writtingModes").css("visibility", "hidden");
	$(".color-picker").css("display", "none");
	$(".mypage, .top").css("display", "block");

}

//フォント変更
$(function () {
	$("[name='fontFamily']").change(function () {
		var font = $(this).val();

		$(".main-edit-content").css("width", "fit-content");
		// debugger;
		currentText = $(`#${currentFocus}`).find(".text");
		currentText.css("fontFamily", font);

		fitty('.fit', {
			minSize: 12,
			maxSize: 100,
		});

		$(".main-edit-content").css("width", "fit-content");
		const resizeWidth = document.querySelectorAll(".fit");
		let px_width = [];

		$(".main-edit-content").css("width", (index, _) => {
			px_width[index] = resizeWidth[index].getBoundingClientRect();
			return `${px_width[index].width}px`;
		});

	});

});

//テキスト縦横変更
$(function () {
	$("[name='writingMode']").change(function () {
		const WTorien = $(this).val();
		currentText = $(`#${currentFocus}`).find(".text");
		currentWidth = $(`#${currentFocus}`).css("height");
		currentHeight = $(`#${currentFocus}`).css("width");

		$(`#${currentFocus}`).css("width", currentWidth);
		$(`#${currentFocus}`).css("height", currentHeight);

		currentText.css("writing-mode", WTorien);
		currentText.css("-webkit-writing-mode", WTorien);
		currentText.css("-ms-writing-mode", WTorien);

		currentWritingMode = currentText.css("writing-mode");

		fitty('.fit', {
			minSize: 12,
			maxSize: 100,
		});
	});
});

const remove_button = document.getElementById("remove");
remove_button.addEventListener("click", removeElement)
/**
 * コンテキストから、対象のDOMを削除するボタンを押した時の処理
 */
function removeElement() {
	let removeElem = document.getElementById(`${deletePointDom}`);
	removeElem.remove();
	delete el[deletePointDom];
	pickr.setColor("#000");
	$("#fontFamily").val("none");
	$("#writingMode").val("none");
	$("#now_elem").text("");
}

/**
 * マウスイベントの追加を行い、DOM要素を配列に格納
 * @param elemValue イベントを追加する要素のclass
 */
function addMouseEvent(elemValue) {
	const objectRef = tempObjects[elemValue];
	el[tempObjects[elemValue].id] = {
		moveElem: document.getElementById(objectRef.id),
		rotateCenter: document.getElementById(objectRef.rotate.rotateCenterId),
		rotateTopFixPoint: document.getElementById(objectRef.rotate.rotateTopFix),
		rotateContent: document.getElementById(objectRef.rotate.rotateContent),
		rotatePoint: document.getElementById(objectRef.rotate.rotateId),
		resizePoint: document.querySelectorAll(objectRef.resizeClass),
		editText: document.getElementById(objectRef.textId)
	};

	// add event
	el[objectRef.id].moveElem.addEventListener("mousedown", mousedown);
	el[objectRef.id].rotatePoint.addEventListener('mousedown', mousedownRotate);
	// debugger;
	for (let resizer of el[objectRef.id].resizePoint) {

		resizer.addEventListener("mousedown", mousedownResize);

	}
	el[objectRef.id].editText.addEventListener("dblclick", set_Editable);
	el[objectRef.id].editText.addEventListener("blur", set_Uneditable);

	// コンテクストメニューを表示する関数を実行
	view_context_menu()

	fitty('.fit', {
		minSize: 12,
		maxSize: 100,
	});
}

function add_style(content_txt, css, elem_class) {
	$(`#${tempObjects[elem_class].textId}`).text(content_txt);
	$(`#${tempObjects[elem_class].rotate.rotateContent}`).css("transform", css.transform);
	$(`#${tempObjects[elem_class].textId}`).css("color", css.color);
	$(`#${tempObjects[elem_class].textId}`).css("fontFamily", css['font-family']);
	$(`#${tempObjects[elem_class].textId}`).css("textAlign", css["text-align"]);
	$(`#${tempObjects[elem_class].textId}`).css("writingMode", css.writingMode);



	$(`#${tempObjects[elem_class].id}`).css("width", css.or_width);
	$(`#${tempObjects[elem_class].id}`).css("top", css.or_top);
	$(`#${tempObjects[elem_class].id}`).css("left", css.or_left);

	setTimeout(() => {
		fitty('.fit', {
			minSize: 12,
			maxSize: 100,
		});
		var visivle_elem = document.querySelector(".edit_area");
		visivle_elem.classList.remove("hidden");
	}, 200);
}

const outputBtn = document.getElementById("outputBtn");
const element = document.getElementById("data");
const getImage = document.getElementById("getImage");


function setWritingMode(elements, mode) {
	elements.forEach((elem) => {
		elem.css({
			"writing-mode": mode,
			"-webkit-writing-mode": mode,
			"-ms-writing-mode": mode
		});
	});
}

function adjustWidth(elements, adjustment) {
	elements.forEach((elem) => {
		const dataId = elem.data("id");
		const parentElem = elem.parents(`#${dataId}`);
		parentElem.css("width", parentElem.width() + adjustment);
	});
}

function applyFitty(selector) {
	fitty(selector, {
		minSize: 12,
		maxSize: 100,
	});
}

outputBtn.addEventListener('click', async function () {
	try {
		if (!window.confirm("手紙を生成します。よろしいですか？")) {
			return;
		}

		let evacuationDom = [];
		let evacuationText = [];
		let resetWriting = $(".text");
		change_preview();

		await Promise.all(resetWriting.map((_, elem) => {
			elem = $(elem);
			if (elem.css("writing-mode") === "vertical-rl") {
				const dataId = elem.data("id");
				const parentElem = elem.parents(`#${dataId}`);
				const fontFamily = elem.css("font-family");
				const widthAdjustment = fontFamily === "yosugara" ? -2 : fontFamily === "serif" ? -21 : -19;
				parentElem.css("width", parentElem.width() + widthAdjustment);

				applyFitty('.fit');

				elem.css("writing-mode", "unset");
				evacuationText.push(elem.text());
				evacuationDom.push(elem);
				elem.text(" " + elem.text());
			}
		}).get());

		if (evacuationDom.length > 0) {
			evacuationDom.forEach((elem, index) => {
				elem.tategaki(evacuationText[index].length);
			});
		}

		// canvas生成のための一時的な遅延
		setTimeout(async () => {
			const canvas = await html2canvas(element, { backgroundColor: null });
			const titleText = document.querySelector(".p-title").textContent || "sample";
			getImage.setAttribute("href", canvas.toDataURL());
			getImage.setAttribute("download", `${titleText}.png`);
			getImage.click();
		}, 10);

		// 元の状態に戻すための遅延
		setTimeout(() => {
			setWritingMode(evacuationDom, "vertical-rl");
			evacuationDom.forEach((elem, index) => {
				elem.empty();
				elem.text(evacuationText[index]);
			});

			adjustWidth(evacuationDom, fontFamily => {
				return fontFamily === "yosugara" ? 2 : fontFamily === "serif" ? 21 : 19;
			});

			applyFitty('.fit');
		}, 1000);

	} catch (error) {
		console.error(error);
	}
});


let count = 0; // 挿入済みHTMLDOMのテンプレート総数をカウントする
let tempBtnRef = []; // ボタン要素を格納する配列

// 各ボタン要素にクリックイベントを付加
for (let index = 0; index < 3; index++) {
	tempBtnRef.push(document.getElementById("temp-" + index));
	tempBtnRef[index].addEventListener('click', insert_dom);
}

function createTemplateObject(count) {
	const elemUnique = ["ft", "sc", "th"];
	let domElement = {};
	elemUnique.forEach((prefix, i) => {
		const rotateBaseId = `${prefix}_rotate_${count}`;
		const textId = `text_${count}`;
		domElement[`${prefix}_content`] = {
			"id": `${prefix}_${count}`,
			"resizeClass": `.resizer-${count}`,
			"rotate": {
				"rotateId": rotateBaseId,
				"rotateCenterId": `${rotateBaseId}Center`,
				"rotateContent": `${rotateBaseId}Content`,
				"rotateTopFix": `${rotateBaseId}_fix`
			},
			"textId": textId,
			"dom": `
				<div class="${prefix}_content context main-edit-content" id="${prefix}_${count}" data-id="${prefix}_${count}" onContextmenu="return false;">
					<div class="rotate" id="${rotateBaseId}_fix" data-rotate="${prefix}_${count}"></div>
					<div class="rotate-center" id="${rotateBaseId}Center" data-rotate="${prefix}_${count}"></div>
					<div data-id="${prefix}_${count}" class="edit_svg on_h" id="${rotateBaseId}Content">
						<div class="resizer-${count} resizer resizer-tl on_n" data-id="${prefix}_${count}"></div>
						<div class="resizer-${count} resizer resizer-tr on_n" data-id="${prefix}_${count}"></div>
						<div class="resizer-${count} resizer resizer-bl on_n" data-id="${prefix}_${count}"></div>
						<div class="resizer-${count} resizer resizer-br on_n" data-id="${prefix}_${count}"></div>
						<div class="rotate_fix on_n" id="${rotateBaseId}" data-rotate="${prefix}_${count}"></div>
						<div class="fit" data-id="${prefix}_${count}">
							<${i === 0 ? 'h1' : i === 1 ? 'h4' : 'p'} class="text" contenteditable="false" id="${textId}" data-id="${prefix}_${count}">
								${i === 0 ? '見出しを追加' : i === 1 ? '小見出しを追加' : '本文を追加'}
							</${i === 0 ? 'h1' : i === 1 ? 'h4' : 'p'}>
						</div>
					</div>
				</div>
			`
		};
	});
	return domElement;
}

function insert_dom(e) {
	// DOMオブジェクト生成
	tempObjects = createTemplateObject(count);

	// クリックされたボタン要素のvalueを取得(temp_objectsのキーとして使用)
	const BtnRef = e.composedPath();
	const valueContent = tempBtnRef[BtnRef[0].dataset.tempid];
	const value = valueContent.getAttribute('value');

	// DOMのinsert
	const insert = document.getElementById("data");
	insert.insertAdjacentHTML('afterbegin', tempObjects[value].dom);

	// insertされたDOMにドラッグイベントを付加
	addMouseEvent(value);
	fitty('.fit', {
		minSize: 12,
		maxSize: 100,
	});
	count++;
}

const pickrContainer = document.querySelector('.color-picker');
const themes = [
	[
		'nano',
		{
			swatches: [
				'rgba(0, 0, 0, 1)',
				'rgba(255, 255, 255, 1)',
				'rgba(255, 0, 0, 1)',
				'rgba(255, 165, 0, 1)',
				'rgba(255, 255, 0, 1)',
				'rgba(0, 255, 0, 1)',
				'rgba(0, 0, 255, 1)'
			],

			components: {
				preview: true,  //現在のカラー
				opacity: false, //透明度
				hue: true,      //色相バー

				interaction: {
					hex: false,
					rgba: false,
					hsva: false,
					input: true,
					clear: false,
					save: true
				}
			}
		}
	]
];

const buttons = [];
let pickr = null;
for (const [theme, config] of themes) {
	const button = document.createElement('button');
	button.innerHTML = theme;
	buttons.push(button);

	button.addEventListener('click', () => {
		const el = document.createElement('p');
		pickrContainer.appendChild(el);

		// Delete previous instance
		if (pickr) {
			pickr.destroyAndRemove();
		}

		// Apply active class
		for (const btn of buttons) {
			btn.classList[btn === button ? 'add' : 'remove']('active');
		}

		// Create fresh instance
		pickr = new Pickr(Object.assign({
			el, theme,
			default: '#000'
		}, config));

		// Set events
		pickr.on('init', instance => {
			console.log('Event: "init"', instance);
		}).on('save', (color) => {
			// debugger;
			currentText.css("color", `${color.toHEXA()}`);
		});

	});

}
buttons[0].click();

window.onload = async function () {
	try {
		var visivle_elem = document.querySelector(".edit_area");
		var query = location.search;
		var value = query.split('=');
		title = "タイトルを入力してください";
		if (value[1]) {
			var serch_id = decodeURIComponent(value[1]);
			const params = { method: "POST", body: JSON.stringify({ "edit_id": serch_id }) };
			const response = await fetch("./get_edit_data.php", params);
			if (response.ok) {
				var redraw_elem = await response.json();
				Object.keys(redraw_elem).forEach((key) => {
					if (key == "_image") {
						// console.log(key);
						// debugger;
						var image_path = redraw_elem[key]["backgroud-image"];
						const first_insert = document.getElementById("data");
						first_insert.style.backgroundImage = `url(../data/img_data/${image_path})`;
						visivle_elem.classList.remove("hidden");
					} else if (key == "title") {
						var redraw_title = redraw_elem["title"];
						if (redraw_title === "sample") {
							redraw_title = "タイトルを入力してください"
						}
						title_elem = document.querySelector(".p-title");
						title_elem.textContent = redraw_title;
						title = redraw_title;
					} else {
						if (redraw_elem[key]["class"].indexOf("ft_content") >= 0) {
							var elem_class = "ft_content";
						} else if (redraw_elem[key]["class"].indexOf("sc_content") >= 0) {
							var elem_class = "sc_content";
						} else if (redraw_elem[key]["class"].indexOf("th_content") >= 0) {
							var elem_class = "th_content";
						}

						const tempObjects = createTemplateObject(count);

						// DOMのinsert
						const insert = document.getElementById("data");
						insert.insertAdjacentHTML('afterbegin', tempObjects[elem_class].dom);

						// insertされたDOMにドラッグイベントを付加
						addMouseEvent(elem_class);
						add_style(redraw_elem[key]["content_txt"], redraw_elem[key]["css"], elem_class);
						fitty('.fit', {
							minSize: 12,
							maxSize: 100,
						});
						//incrementCount
						count++;
					}

				});
			}
			else {
				console.log("no");
			}
		} else {
			visivle_elem.classList.remove("hidden");
			console.log("not save");
		}
	} catch (error) {
		console.log(error);
	}
}