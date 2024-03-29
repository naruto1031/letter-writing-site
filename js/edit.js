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
	window.addEventListener("mousemove", mousemove);
	window.addEventListener("mouseup", mouseup);

	let prevX = e.clientX;
	let prevY = e.clientY;

	clickedId = getId(e, "id");

	function mousemove(e) {
		if (!isRotate && !isResizing && isMove) {
			let newX = prevX - e.clientX;
			let newY = prevY - e.clientY;

			const rect = el[clickedId].moveElem.getBoundingClientRect();

			el[clickedId].moveElem.style.left = rect.left - newX + "px";
			el[clickedId].moveElem.style.top = rect.top - newY + "px";

			el[clickedId].moveElem.style.left = rect.left - newX + "px";
			el[clickedId].moveElem.style.top = rect.top - newY + "px";

			prevX = e.clientX;
			prevY = e.clientY;

		}
	}
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

	currentResizer = e.target;
	isResizing = true;
	let prevX = e.clientX;

	//  mousemove mouseupイベントそれぞれを指定要素に付加
	window.addEventListener("mousemove", mousemoveResize);
	window.addEventListener("mouseup", mouseupResize);

	function mousemoveResize(e) {
		let rect = el[clickedId].moveElem.getBoundingClientRect();
		const calcHeight = (rect.width - (prevX - e.clientX)) * heightRatios;

		if (currentResizer.classList.contains("resizer-br")) {
			// 右下
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
		} else if (currentResizer.classList.contains("resizer-bl")) {
			// 左下
			el[clickedId].moveElem.style.width = rect.width + (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
			el[clickedId].moveElem.style.left = rect.left - (prevX - e.clientX) + "px";
		} else if (currentResizer.classList.contains("resizer-cr")) {
			// 右中央
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
		} else if (currentResizer.classList.contains("resizer-tr")) {
			// 右上
			el[clickedId].moveElem.style.width = rect.width - (prevX - e.clientX) + "px";
			el[clickedId].moveElem.style.height = calcHeight + "px";
			rect = el[clickedId].moveElem.getBoundingClientRect();
			el[clickedId].moveElem.style.top = rect.top - (rect.bottom - getRect.bottom) + "px";
		} else {
			// 左上
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

		prevX = e.clientX;
		prevY = e.clientY;
	}
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

	const centerPosition = {
		x: centerRect.top,
		y: centerRect.left
	};

	function mousemoveRotate(e) {
		const prev = {
			x: e.clientY,
			y: e.clientX
		};

		const oppositeSide = Math.sqrt(((prev.x - topPosition.x) ** 2) + ((prev.y - topPosition.y) ** 2));
		const flankingSideFirst = Math.sqrt(((prev.x - centerPosition.x) ** 2) + ((prev.y - centerPosition.y) ** 2));
		const flankingSideSecond = Math.sqrt(((topPosition.x - centerPosition.x) ** 2) + ((topPosition.y - centerPosition.y) ** 2));
		const cosX = (((flankingSideFirst ** 2) + (flankingSideSecond ** 2) - (oppositeSide ** 2)) / (2 * flankingSideFirst * flankingSideSecond));

		const radian = Math.acos(cosX);
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
const insertElement = document.getElementById("data");
const selectImg = document.querySelectorAll(".select-img-all");
let currentUrl = url[0];
selectImg.forEach((img, index) => {
	img.addEventListener("click", () => {
		currentUrl = url[index];
		insertElement.style.backgroundImage = `url(./data/img_data/${url[index]})`;
	});
});

/**
 * 対象のDOMを右クリックした時のコンテキストメニュー表示アニメーション
 */
function viewContextMenu() {
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
function setEditable(e) {
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
function setUneditable(e) {
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
onEdit.addEventListener("click", changeEdit);

function changeEdit() {
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
offEdit.addEventListener("click", changePreview);

function changePreview() {
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
		let pxWidth = [];

		$(".main-edit-content").css("width", (index, _) => {
			pxWidth[index] = resizeWidth[index].getBoundingClientRect();
			return `${pxWidth[index].width}px`;
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

const removeButton = document.getElementById("remove");
removeButton.addEventListener("click", removeElement)
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
	el[objectRef.id].editText.addEventListener("dblclick", setEditable);
	el[objectRef.id].editText.addEventListener("blur", setUneditable);

	// コンテクストメニューを表示する関数を実行
	viewContextMenu()

	fitty('.fit', {
		minSize: 12,
		maxSize: 100,
	});
}

function addStyle(content_txt, css, elem_class) {
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
		const visibleElem = document.querySelector(".edit_area");
		visibleElem.classList.remove("hidden");
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
		changePreview();

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

		setTimeout(async () => {
			const canvas = await html2canvas(element, { backgroundColor: null });
			const titleText = document.querySelector(".p-title").textContent || "sample";
			getImage.setAttribute("href", canvas.toDataURL());
			getImage.setAttribute("download", `${titleText}.png`);
			getImage.click();
		}, 10);

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

let domCount = 0;
let tempBtnRef = [];

for (let index = 0; index < 3; index++) {
	tempBtnRef.push(document.getElementById("temp-" + index));
	tempBtnRef[index].addEventListener('click', insert_dom);
}

function createTemplateObject(domCount) {
	const elemUnique = ["ft", "sc", "th"];
	let domElement = {};
	elemUnique.forEach((prefix, i) => {
		const rotateBaseId = `${prefix}_rotate_${domCount}`;
		const textId = `text_${domCount}`;
		domElement[`${prefix}_content`] = {
			"id": `${prefix}_${domCount}`,
			"resizeClass": `.resizer-${domCount}`,
			"rotate": {
				"rotateId": rotateBaseId,
				"rotateCenterId": `${rotateBaseId}Center`,
				"rotateContent": `${rotateBaseId}Content`,
				"rotateTopFix": `${rotateBaseId}_fix`
			},
			"textId": textId,
			"dom": `
				<div class="${prefix}_content context main-edit-content" id="${prefix}_${domCount}" data-id="${prefix}_${domCount}" onContextmenu="return false;">
					<div class="rotate" id="${rotateBaseId}_fix" data-rotate="${prefix}_${domCount}"></div>
					<div class="rotate-center" id="${rotateBaseId}Center" data-rotate="${prefix}_${domCount}"></div>
					<div data-id="${prefix}_${domCount}" class="edit_svg on_h" id="${rotateBaseId}Content">
						<div class="resizer-${domCount} resizer resizer-tl on_n" data-id="${prefix}_${domCount}"></div>
						<div class="resizer-${domCount} resizer resizer-tr on_n" data-id="${prefix}_${domCount}"></div>
						<div class="resizer-${domCount} resizer resizer-bl on_n" data-id="${prefix}_${domCount}"></div>
						<div class="resizer-${domCount} resizer resizer-br on_n" data-id="${prefix}_${domCount}"></div>
						<div class="rotate_fix on_n" id="${rotateBaseId}" data-rotate="${prefix}_${domCount}"></div>
						<div class="fit" data-id="${prefix}_${domCount}">
							<${i === 0 ? 'h1' : i === 1 ? 'h4' : 'p'} class="text" contenteditable="false" id="${textId}" data-id="${prefix}_${domCount}">
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
	tempObjects = createTemplateObject(domCount);
	const BtnRef = e.composedPath();
	const valueContent = tempBtnRef[BtnRef[0].dataset.tempid];
	const value = valueContent.getAttribute('value');

	const insert = document.getElementById("data");
	insert.insertAdjacentHTML('afterbegin', tempObjects[value].dom);

	addMouseEvent(value);
	fitty('.fit', {
		minSize: 12,
		maxSize: 100,
	});
	domCount++;
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

		if (pickr) {
			pickr.destroyAndRemove();
		}

		for (const btn of buttons) {
			btn.classList[btn === button ? 'add' : 'remove']('active');
		}

		pickr = new Pickr(Object.assign({
			el, theme,
			default: '#000'
		}, config));

		pickr.on('init', instance => {
			console.log('Event: "init"', instance);
		}).on('save', (color) => {
			currentText.css("color", `${color.toHEXA()}`);
		});

	});

}
buttons[0].click();

window.onload = async function () {
	try {
		const visibleElem = document.querySelector(".edit_area");
		let query = location.search;
		let value = query.split('=');
		title = "タイトルを入力してください";
		if (value[1]) {
			const searchId = decodeURIComponent(value[1]);
			const params = { method: "POST", body: JSON.stringify({ "edit_id": searchId }) };
			const response = await fetch("./get_edit_data.php", params);
			if (response.ok) {
				var redraw_elem = await response.json();
				Object.keys(redraw_elem).forEach((key) => {
					if (key == "_image") {
						const image_path = redraw_elem[key]["backgroud-image"];
						const first_insert = document.getElementById("data");
						first_insert.style.backgroundImage = `url(../data/img_data/${image_path})`;
						visibleElem.classList.remove("hidden");
					} else if (key == "title") {
						var redraw_title = redraw_elem["title"];
						if (redraw_title === "sample") {
							redraw_title = "タイトルを入力してください"
						}
						title_elem = document.querySelector(".p-title");
						title_elem.textContent = redraw_title;
						title = redraw_title;
					} else {
						let elem_class = "";
						if (redraw_elem[key]["class"].indexOf("ft_content") >= 0) {
							elem_class = "ft_content";
						} else if (redraw_elem[key]["class"].indexOf("sc_content") >= 0) {
							elem_class = "sc_content";
						} else if (redraw_elem[key]["class"].indexOf("th_content") >= 0) {
							elem_class = "th_content";
						}
						const tempObjects = createTemplateObject(domCount);
						const insert = document.getElementById("data");
						insert.insertAdjacentHTML('afterbegin', tempObjects[elem_class].dom);

						addMouseEvent(elem_class);
						addStyle(redraw_elem[key]["content_txt"], redraw_elem[key]["css"], elem_class);
						fitty('.fit', {
							minSize: 12,
							maxSize: 100,
						});
						domCount++;
					}

				});
			}
			else {
				console.log("no");
			}
		} else {
			visibleElem.classList.remove("hidden");
			console.log("not save");
		}
	} catch (error) {
		console.log(error);
	}
}