function hexToRGB(hexString) {
  let hexes = hexString.match(/[^#]{1,2}/g); 
  let [r, g, b] =  hexes.map(hex => parseInt(hex, 16));
  return {'r': r, 'g': g, 'b': b}
}

function RGBtoCMYK(rgb) {
  let k;
  if (rgb.r === 0 || rgb.g === 0 || rgb.b === 0) {
    k = 0
  } else {
    k = Math.min(1 - (rgb.r / 255), 1 - (rgb.g / 255), 1 - (rgb.b / 255));
  }
  let c = (1 - (rgb.r / 255) - k) / (1 - k);
  let m = (1 - (rgb.g / 255) - k) / (1 - k);
  let y = (1 - (rgb.b / 255) - k) / (1 - k);
  
  return {'c': c, 'm': m, 'y': y, 'k': k}
}

function mix(c1, c2) {
  let cAvg = Math.sqrt((Math.pow(c1.cmyk.c, 2) + Math.pow(c2.cmyk.c, 2)) / 2);
  let mAvg = Math.sqrt((Math.pow(c1.cmyk.m, 2) + Math.pow(c2.cmyk.m, 2)) / 2);
  let yAvg = Math.sqrt((Math.pow(c1.cmyk.y, 2) + Math.pow(c2.cmyk.y, 2)) / 2);
  let kAvg = Math.sqrt((Math.pow(c1.cmyk.k, 2) + Math.pow(c2.cmyk.k, 2)) / 2);
  return {c: cAvg, m: mAvg, y: yAvg, k: kAvg}
}

function CMYKtoRGB(cmyk) {
  let r = Math.round(255 * ((1 - cmyk.c) * (1 - cmyk.k)));
  let g = Math.round(255 * ((1 - cmyk.m) * (1 - cmyk.k)));
  let b = Math.round(255 * ((1 - cmyk.y) * (1 - cmyk.k)));
  return {'r': r, 'g': g, 'b': b}
}

function generateMix() {
  let randomIndex1; let randomIndex2;
  while (randomIndex1 === randomIndex2) {
    randomIndex1 = Math.floor(Math.random() * 143)
    randomIndex2 = Math.floor(Math.random() * 143)
  }
  let c1 = colours[randomIndex1];
  let c2 = colours[randomIndex2];
  return {'c1': c1, 'c2': c2, 'rgb': CMYKtoRGB(mix(c1, c2))}
}

function similarColour1(correctMix) {
  let sumCorrectMix = correctMix.rgb.r + correctMix.rgb.g + correctMix.rgb.b; 
  let difference = 0;
  let r; let g; let b;
  while (difference < 5 || difference > 50) {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
    let sumRandomValues = r + g + b;
    difference = Math.abs(sumCorrectMix - sumRandomValues)
  }
  return {'rgb': {'r': r, 'g': g, 'b': b}}
}

function similarColour2(correctMix) {
  let options = ['r', 'g', 'b'];
  let randomIndex = Math.floor(Math.random() * 3);
  let copy = Object.assign({}, correctMix.rgb);
  let randomValue;
  let difference = 0;
  while (difference < 20) {
    randomValue = Math.floor(Math.random() * 256);
    difference = Math.abs(copy[options[randomIndex]] - randomValue)
  } 
  copy[options[randomIndex]] = randomValue;
  options.splice(randomIndex, 1);
  randomIndex2 = Math.floor(Math.random() * 2)
  copy[options[randomIndex2]] = Math.floor((copy[options[randomIndex2]] 
                                               + Math.floor(Math.random() * 256)) / 2);
  return {'rgb': copy}
}

function formatRGB(colour) {
  return `rgb(${colour.r}, ${colour.g}, ${colour.b})` 
}

function generateOptionsArray() {
  let mix = generateMix();
  let options = [{'mix': mix}, {'sc1': similarColour1(mix)}, {'sc2': similarColour2(mix)}];
  let randomIndex = Math.floor(Math.random() * 3);
  let firstOption = options[randomIndex];
  options.splice(randomIndex, 1);
  let randomIndex2 = Math.floor(Math.random() * 2);
  let secondOption = options[randomIndex2];
  options.splice(randomIndex2, 1);
  return [firstOption, secondOption, options[0]]
}

function reformatRGB(stringRGB) {
  let array = stringRGB.match(/\d+/g)
  return {'r': array[0], 'g': array[1], 'b': array[2]}
}

function isRGBDark(rgb) {
  let brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return brightness < 155
}

function setTextColour(element) {
  if ( isRGBDark(reformatRGB(element.style.backgroundColor))) {
    element.style.color = "white"
  } else {
    element.style.color = "black"
  }
}

function drawResult(buttonClicked, c1, c2, correctIndex) {
  let result;
  if (buttonClicked.classList.contains('correct')) {
    result = 'correct'
  }
  guessButtons.forEach(button => button.classList.add('disabled'))
  resultContainer.classList.remove('hide');
  mix1.style.backgroundColor = c1.hex;
  mix1.innerHTML = c1.name
  mix2.style.backgroundColor = c2.hex;
  mix2.innerHTML = c2.name
  setTextColour(mix1);
  setTextColour(mix2);
  setTextColour(buttonClicked);
  playCount++;
  if (result === 'correct') {
    correctCount++;
    buttonClicked.innerHTML = "☒"
    document.getElementById('result-text').innerHTML = 
      "Correct! The colour you clicked is a mixture of "
  } else {
    buttonClicked.innerHTML = "✗";
    let correctButton = document.getElementById('btn' + correctIndex);
    setTextColour(correctButton);
    correctButton.innerHTML = "☐"; 
    resultText.innerHTML = 
      "Incorrect! The colour you clicked is not a mixture of "
  }
  resultCounter.innerHTML = `${correctCount} out of ${playCount} answers correct`
  next.onclick = () => drawQuestion();
}

function drawQuestion() {
  resultContainer.classList.add('hide');
  for (button of guessButtons) {
    button.innerHTML = "";
    button.classList.remove('correct')
    button.classList.remove('disabled')
  }
  let options = generateOptionsArray();
  let c1; let c2; let correctIndex;
  let colourValues = [];
  for (let [i, option] of options.entries()) {
    colourValues.push(Object.values(option)[0].rgb);
    if ("mix" in option) {
      c1 = option.mix.c1;
      c2 = option.mix.c2;
      correctIndex = i;
    }
  }
  questionContainer.innerHTML = `Which colour is a mixture of <i>${c1.name}</i> and <i>${c2.name}</i>?`
  btn0.style.backgroundColor = formatRGB(colourValues[0]);
  btn1.style.backgroundColor = formatRGB(colourValues[1]);
  btn2.style.backgroundColor = formatRGB(colourValues[2]);
  [btn0, btn1, btn2][correctIndex].classList.add("correct");
  btn0.onclick = () => drawResult(btn0, c1, c2, correctIndex);
  btn1.onclick = () => drawResult(btn1, c1, c2, correctIndex);
  btn2.onclick = () => drawResult(btn2, c1, c2, correctIndex);
}

let colours = names;
colours.forEach(colour => colour.cmyk = RGBtoCMYK(hexToRGB(colour.hex)));
const questionContainer = document.getElementById('question');
const guessButtons = document.querySelectorAll('.guess-button');
const btn0 = document.getElementById("btn0");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const next = document.getElementById('next');
const resultText = document.getElementById('result-text');
const resultContainer = document.getElementById('result-container');
const mix1 = document.getElementById('mix1');
const mix2 = document.getElementById('mix2');
const resultCounter = document.getElementById('result-counter');
let playCount = 0;
let correctCount = 0;
drawQuestion();