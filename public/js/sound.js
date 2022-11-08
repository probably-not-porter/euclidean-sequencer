const global = {};
/*
Backend javascript for creating and playing sequences using Tone.js
*/

console.log("sound.js loaded");
document.documentElement.addEventListener('mousedown', () => {
    if (Tone.context.state !== 'running') Tone.context.resume();
}); //fix Chrome constraints when you have to trigger to play music
global.step_val = 1;
global.num_cycle = 6;

const synths = [//create an array of synth objects
    new Tone.Synth(),
    new Tone.Synth(),
    new Tone.Synth(),
    new Tone.Synth(),
    new Tone.Synth(),
    new Tone.Synth()
];

let offset_values = [0, 0, 0, 0, 0, 0];//an array storing offset values of all voices

const gain = new Tone.Gain(0.5);
gain.toMaster(); //gain volume

synths.forEach(synth => synth.connect(gain));

let wave_type = 'sine';
tempo = '8n';

synths[0].oscillator.type = wave_type;//initialize voices
synths[1].oscillator.type = wave_type;
synths[2].oscillator.type = wave_type;


/*
Code connecting effect nodes to synth voices.
Commented out because we never implented UI controls, but decided to leave
it in for potential future maintanence.
 
var vib = new Tone.Vibrato(6, 0.0).toMaster();
var dist = new Tone.Distortion(0.0).toMaster();
var autoFilter = new Tone.AutoFilter(5).toMaster().start();
for (let s = 0; s < synths.length; s++) {
    synths[s].connect(dist);
    synths[s].connect(vib);
    synths[s].connect(autoFilter);
}
*/


function makeEuclidSeq(steps, pulses) {
    /*
    function takes a step and a pulse as input
    return an array of binary values with Euclidean rules
    */
    let seq = [];
    let x = 0;
    let y = 0;
    for (let s = 0; s < steps; s++) {
        y = (((s + 1) * pulses) / steps);
        if (y > x) {
            x++;
            seq.push(1);
        } else {
            seq.push(0);
        }

    }
    return seq;
}

function offset(seq_in, offset) { 
	//return sequence array shifted by offset value
    steps = seq_in.length;
    offset = offset % steps; //fix if offset is longer than sequence
    let seq_front = seq_in.slice(0, steps - offset);
    let seq_back = seq_in.slice(steps - offset);
    let seq_out = seq_back.concat(seq_front);
    return seq_out;
}

function updatePitch(pitch_code, voice_number) {
	//update note value of a voice on UI change
    notes[voice_number] = pitch_code;
}
function updateOctave(oct_code, voice_number) {
	//update octave value on UI change
    notes[voice_number] = notes[voice_number].substring(0, notes[voice_number].length - 1) + String(oct_code);
}

function updateDisplay() {
	//call display change for each step
    var parent_voice = document.getElementById("controlbtns");
    var children_voice = parent_voice.children;
    document.getElementById("voice_num_value").innerHTML = String(global.num_cycle);
    for (var i = 1; i < children_voice.length; i++) {
        if (i > global.num_cycle) {
            children_voice[i].style.display = "none";
            document.getElementById("circle" + i).style.display = "none";
        } else {
            children_voice[i].style.display = "inline-block";
            document.getElementById("circle" + i).style.display = "inline-block";
        }
    }
}

function addVoice() {
    if (cycles.length < 6) {
        cycles.push(makeEuclidSeq(global.step_val, 1));
        global.num_cycle += 1;
        updateDisplay()
    }
}

function removeVoice() {
    if (cycles.length > 1) {
        cycles.pop();
        global.num_cycle -= 1;
        updateDisplay();
    }
}

var cycles = [offset(makeEuclidSeq(8,1),0),offset(makeEuclidSeq(8,1),0),offset(makeEuclidSeq(8,1),0),offset(makeEuclidSeq(8,1),0),offset(makeEuclidSeq(8,1)),],
    notes = ['C4', 'E4', 'G4','B4','D5','F5'];//load default settings
let index = 0;

Tone.Transport.scheduleRepeat(loop, "8n");
//Tone.Transport.start();

function loop(time) {
	//play current step, update step
    if (document.getElementById("step_val") != null) {
        global.step_val = document.getElementById("step_val").value;
    }
    let step = index % global.step_val;
    // document.getElementById("step_counter").innerHTML = step; //output step # to screen
    for (let i = 0; i < cycles.length; i++) {
        let synth = synths[i],
            note = notes[i],
            cycle = global.cycles[i],
            input = cycle[step];
        // console.log(note, cycle[i]);
        if (input == 1) synth.triggerAttackRelease(note, "8n", time); //play the note if the current buffer is 1
    }
    activeStep(step);
    index++;
}

function updateOffset(voice, offset_val) {
	//update the offset (increase/decrease the starting point of a sequence)
    offset_values[voice - 1] = parseInt(offset_val);
    pulse_count = document.getElementById("pulse_val_" + voice).value;
    cycles[voice - 1] = offset(makeEuclidSeq(global.step_val, pulse_count), offset_values[voice - 1]);
}


function updateTempo(tempo) {
    Tone.Transport.bpm.value = tempo;
}

function updateWave(wave, voice) {
    synths[voice-1].oscillator.type = wave;
}


function updateSeq() {
    //update the pulses, sound, and steps, called from the front end.
    var steps = 1,
        pulse_one = 1,
        pulse_two = 1,
        pulse_three = 1,
        pulses = [],
        cycles = [];
    if (document.getElementById("step_val") != null) {
        global.step_val = document.getElementById("step_val").value;
        for (var j = 1; j < global.num_cycle + 1; j++) {
            pulses.push(document.getElementById("pulse_val_" + j).value);
        }
    }
    for (var j = 0; j < global.num_cycle; j++) {
        cycles.push(offset(makeEuclidSeq(global.step_val, pulses[j]), offset_values[j]));
    }
    global.cycles = cycles;//2d array stores arrays of binary values
}


function activeStep(current_step) {
    //set the active step(while playing) to dot_active class
    voices = [];
    for (var i = 1; i < global.num_cycle + 1; i++) {
        voices.push("circle" + i);
    }
    // voices = ['circle1','circle2','circle3'];
    for (let i = 0; i < voices.length; i++) { // iterate over i voices
        var container = document.getElementById(voices[i]);
        if (container != null) {
            var children = container.children;
            for (let j = 0; j < children.length; j++) { // iterate over j children of voice i
                children[j].setAttribute('id', 'dot' + String(i + 1)); // reset the class of all children in voice i
            }
            children[current_step].setAttribute('id', 'dot_active'); // set active step to be of different subclass
            // this way it will be a different color.
        }
    }
}
