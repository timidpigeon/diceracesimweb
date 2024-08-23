const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const bgimg = new Image()
bgimg.onload = drawBackground
bgimg.src = "dicetrack.png"

const PINSIZE = [45,60]
const pinimg = new Image()
pinimg.onlond = drawPin
pinimg.src = "pin.svg"

const trackcenters = [[817,142], [680,142], [542,144],  [404,144], 
                      [274,152], [165,209], [127,296],  [159,389], 
                      [257,444], [395,458], [539,458],  [686,458], 
                      [832,460], [962,447], [1064,389], [1097,296],
                      [1056,205], [946,149]]
const PINXOFFSET = -30
const PINYOFFSET = -55
var locations = trackcenters
for (var i = 0; i < locations.length; i++) {
    locations[i][0] += PINXOFFSET
    locations[i][1] += PINYOFFSET
}

var current_cell = 0

// rows go miyu eleph, credits, yellow orb, exp report, eligma, fixed dice ticket
const REWAREDS = [[5,       0,  0,  0, 0, 7,  0,       0, 0,       0,  0,  0, 0, 4, 0,  0,       0,  0], // miyu
                  [0, 3200000,  0,  0, 0, 0,  0, 2400000, 0, 1600000,  0,  0, 0, 0, 0,  0, 2000000,  0], // credits
                  [0,       0, 15,  0, 0, 0,  0,       0, 0,       0, 12,  0, 0, 0, 0, 10,       0,  0], // yellow orb
                  [0,       0,  0, 22, 0, 0,  0,       0, 0,       0,  0, 10, 0, 0, 0,  0,       0, 17], // yellow report
                  [0,       0,  0,  0, 8, 0, 12,       0, 0,       0,  0,  0, 6, 0, 0,  0,       0,  0], // eligma
                  [0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0], // purple orb
                  [0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0], // purple report
                  [0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0], // STN
                  [0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0], // 1-recruit-ticket
                 ]

var current_location_visit_count = [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]]

for (var i = 0; i < REWAREDS.length; i++){
    document.getElementById("loot"+i).value = 0
}


var fixed_dice_ticket = [0,0,0,0,0,0]
for (var i = 1; i <= fixed_dice_ticket.length; i++){
    document.getElementById("fixed"+i).value = 0
}


var total_roll_count = 0
document.getElementById("rollcount").value = total_roll_count

var total_laps = 0
document.getElementById("lapcount").value = total_laps



const LAP_REWAREDS = [[ 3,       3,  3,  3, 3, 3,  3,       3, 3,       3,  5,  5, 5, 5, 5,  5,       5,  5, 5, 5], // miyu
                      [ 0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  1200000,  1200000, 1200000, 1200000, 1200000,  2000000,       2000000,  2000000, 2000000, 2000000], // credits

                      [ 0,      20,  0, 40, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // yellow orb
                      [20,       0, 40,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // yellow report

                      [ 0,       0,  0,  0, 0, 0,  0,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // eligma

                      [ 0,       0,  0,  0, 0,15,  0,       0,20,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // purple orb
                      [ 0,       0,  0,  0,15, 0,  0,      20, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // purple report

                      [ 0,       0,  0,  0, 0, 0,  0,       0, 0,       1,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // STN
                      [ 0,       0,  0,  0, 0, 0,  5,       0, 0,       0,  0,  0, 0, 0, 0,  0,       0,  0, 0, 0], // 1-recruit-ticket
                     ]


var lap_ticks = [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]]



const BEST_TILES = [[0, 5, 13], [1, 7, 9, 16], [2,10,15], [3,11,17], [4,6,12]]



let random = ()=> crypto.getRandomValues(new Uint32Array(1))[0]/2**32;

function drawBackground() {
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;

    // given in the constructor
    ctx.drawImage(this, 0, 0);
    ctx.drawImage(pinimg, locations[0][0], locations[0][1], PINSIZE[0], PINSIZE[1]);
}

function drawPin() {
    ctx.drawImage(this, locations[0][0], locations[0][1], PINSIZE[0], PINSIZE[1]);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgimg, 0, 0);
}

function diceRollClick(){
    total_roll_count += 1
    document.getElementById("rollcount").value = total_roll_count
    step = rollDice();
    movePin(step, true)
}

function fixedTicketUse(button){
    step = parseInt(button.innerText)

    if (fixed_dice_ticket[step - 1] > 0) {
        fixed_dice_ticket[step - 1] -= 1
        document.getElementById("fixed" + button.innerText).value = fixed_dice_ticket[step - 1]
        movePin(step, true)
    }
}

function movePin(step, redraw){
    if (current_cell + step >= locations.length) {
        total_laps += 1
        if (redraw) {
            document.getElementById("lapcount").value = total_laps
        }

        if (total_laps < 21){
            lap_ticks[total_laps - 1][0] = 1
        }

        if (total_laps == 2 || total_laps == 4 || total_laps == 6 || total_laps == 8 || total_laps == 10) {
            fixed_dice = rollDice() - 1
            fixed_dice_ticket[fixed_dice] += 1

            if (redraw) {
                document.getElementById("fixed" + (fixed_dice + 1)).value = fixed_dice_ticket[fixed_dice]
            }
        }
    }


    current_cell = (current_cell + step) % locations.length;
    if (current_cell == 8) {
        current_cell += 6
    }

    current_location_visit_count[current_cell][0] += 1
    current_rewards = math.multiply(REWAREDS, current_location_visit_count)
    current_lap_rewards = math.multiply(LAP_REWAREDS, lap_ticks)
    current_rewards = math.add(current_rewards, current_lap_rewards)

    if (redraw) {
        for (var i = 0; i < current_rewards.length; i++){
            document.getElementById("loot"+i).value = current_rewards[i]
        }
    }

    if (current_cell == 14) {
        fixed_dice = rollDice() - 1
        fixed_dice_ticket[fixed_dice] += 1

        if (redraw) {
            document.getElementById("fixed" + (fixed_dice + 1)).value = fixed_dice_ticket[fixed_dice]
        }
    }

    if(redraw) {
        drawMovePin();
    }
}



function autodiceroll(){
    total_roll_count += 1
    step = rollDice();
    movePin(step, false)
}

function autoticketuse(step){
    if (fixed_dice_ticket[step - 1] > 0) {
        fixed_dice_ticket[step - 1] -= 1
        movePin(step, false)
    }
}


function autoroll(){
    resetGlobal();

    optarget = document.querySelector('input[name="maxtarget"]:checked')
    if (optarget == null) {
        optiles = [] 
    } else {
        optarget = parseInt(optarget.value)
        optiles = BEST_TILES[optarget]
    }
    rollcount = parseInt(document.getElementById("autorollcount").value)


    var i = 0;
    doroll: while (i < rollcount){

        for (var fixed_dice_i = 0; fixed_dice_i < fixed_dice_ticket.length; fixed_dice_i++) {
            fdstep = fixed_dice_i + 1;
            if (fixed_dice_ticket[fixed_dice_i] > 0 && optiles.includes(current_cell + fdstep)){
                autoticketuse(fdstep)
                continue doroll;
            }
        }
        
        autodiceroll()
        i++
    }


    // output rewards and remaining dice fixed
    current_rewards = math.multiply(REWAREDS, current_location_visit_count)
    current_lap_rewards = math.multiply(LAP_REWAREDS, lap_ticks)
    current_rewards = math.add(current_rewards, current_lap_rewards)

    for (var i = 0; i < current_rewards.length; i++){
        document.getElementById("loot"+i).value = current_rewards[i]
    }
    for (var i = 1; i <= fixed_dice_ticket.length; i++){
        document.getElementById("fixed"+i).value = fixed_dice_ticket[i-1]
    }

    document.getElementById("rollcount").value = total_roll_count
    document.getElementById("lapcount").value = total_laps
    
    resetGlobal()
}


function largesample(){
    optarget = document.querySelector('input[name="maxtarget"]:checked')
    if (optarget == null) {
        optiles = [] 
    } else {
        optarget = parseInt(optarget.value)
        optiles = BEST_TILES[optarget]
    }
    rollcount = parseInt(document.getElementById("autorollcount").value)

    sum_current_rewards = [[0],[0],[0],[0],[0],[0],[0],[0],[0]]
    sum_fixed_dice_ticket = [0,0,0,0,0,0]
    sum_total_roll_count = 0
    sum_total_laps = 0

    catrewards = -1

    const NSAMPLE = 200
    
    for (var sample = 0; sample < NSAMPLE; sample++){
        resetGlobal();

        var i = 0;
        doroll: while (i < rollcount){

            for (var fixed_dice_i = 0; fixed_dice_i < fixed_dice_ticket.length; fixed_dice_i++) {
                fdstep = fixed_dice_i + 1;
                if (fixed_dice_ticket[fixed_dice_i] > 0 && optiles.includes(current_cell + fdstep)){
                    autoticketuse(fdstep)
                    continue doroll;
                }
            }
            
            autodiceroll()
            i++
        }

        // output rewards and remaining dice fixed
        current_rewards = math.multiply(REWAREDS, current_location_visit_count)
        current_lap_rewards = math.multiply(LAP_REWAREDS, lap_ticks)
        current_rewards = math.add(current_rewards, current_lap_rewards)

        sum_current_rewards = math.add(sum_current_rewards, current_rewards)
        sum_fixed_dice_ticket = math.add(sum_fixed_dice_ticket, fixed_dice_ticket)

        if (catrewards === -1){
            catrewards = current_rewards
        } else {
            catrewards = math.concat(catrewards, current_rewards)
        }

        sum_total_roll_count += total_roll_count
        sum_total_laps += total_laps
    }

    stdvrewards = math.std(catrewards, 1)
    minrewards = math.min(catrewards, 1)
    maxrewards = math.max(catrewards, 1)

    sum_current_rewards = math.dotDivide(sum_current_rewards, NSAMPLE);
    sum_fixed_dice_ticket = math.dotDivide(sum_fixed_dice_ticket, NSAMPLE)
    sum_total_roll_count /= NSAMPLE
    sum_total_laps /= NSAMPLE

    for (var i = 0; i < sum_current_rewards.length; i++){
        document.getElementById("loot"+i).value = sum_current_rewards[i]
        document.getElementById("statsloot"+i).textContent = `min: ${minrewards[i]}, max: ${maxrewards[i]}, standard deviation: ${stdvrewards[i]}`
    }
    for (var i = 1; i <= sum_fixed_dice_ticket.length; i++){
        document.getElementById("fixed"+i).value = sum_fixed_dice_ticket[i-1]
    }

    document.getElementById("rollcount").value = sum_total_roll_count
    document.getElementById("lapcount").value = sum_total_laps

    resetGlobal()
}



function genDump(){
    document.getElementById("printer").value = ""

    optarget = document.querySelector('input[name="maxtarget"]:checked')
    if (optarget == null) {
        optiles = [] 
    } else {
        optarget = parseInt(optarget.value)
        optiles = BEST_TILES[optarget]
    }

    rollcount = parseInt(document.getElementById("autorollcount").value)

    for (var upto = 1; upto <= rollcount; upto++){
        
        sum_current_rewards = [[0],[0],[0],[0],[0],[0],[0],[0],[0]]
        sum_fixed_dice_ticket = [0,0,0,0,0,0]
        sum_total_roll_count = 0
        sum_total_laps = 0

        catrewards = -1

        const NSAMPLE = 200
        
        for (var sample = 0; sample < NSAMPLE; sample++){
            resetGlobal();

            var i = 0;
            doroll: while (i < upto){

                for (var fixed_dice_i = 0; fixed_dice_i < fixed_dice_ticket.length; fixed_dice_i++) {
                    fdstep = fixed_dice_i + 1;
                    if (fixed_dice_ticket[fixed_dice_i] > 0 && optiles.includes(current_cell + fdstep)){
                        autoticketuse(fdstep)
                        continue doroll;
                    }
                }
                
                autodiceroll()
                i++
            }

            // output rewards and remaining dice fixed
            current_rewards = math.multiply(REWAREDS, current_location_visit_count)
            current_lap_rewards = math.multiply(LAP_REWAREDS, lap_ticks)
            current_rewards = math.add(current_rewards, current_lap_rewards)

            sum_current_rewards = math.add(sum_current_rewards, current_rewards)
            sum_fixed_dice_ticket = math.add(sum_fixed_dice_ticket, fixed_dice_ticket)

            if (catrewards === -1){
                catrewards = current_rewards
            } else {
                catrewards = math.concat(catrewards, current_rewards)
            }

            sum_total_roll_count += total_roll_count
            sum_total_laps += total_laps
        }

        stdvrewards = math.std(catrewards, 1)
        minrewards = math.min(catrewards, 1)
        maxrewards = math.max(catrewards, 1)

        sum_current_rewards = math.dotDivide(sum_current_rewards, NSAMPLE);
        sum_fixed_dice_ticket = math.dotDivide(sum_fixed_dice_ticket, NSAMPLE)
        sum_total_roll_count /= NSAMPLE
        sum_total_laps /= NSAMPLE

        document.getElementById("printer").value += (sum_current_rewards[0] - stdvrewards[0]).toString() + "\n"

        resetGlobal()
    }
}




function resetButton(){
    resetGlobal()
    current_rewards = math.multiply(REWAREDS, current_location_visit_count)
    current_lap_rewards = math.multiply(LAP_REWAREDS, lap_ticks)
    current_rewards = math.add(current_rewards, current_lap_rewards)
    for (var i = 0; i < current_rewards.length; i++){
        document.getElementById("loot"+i).value = current_rewards[i]
    }
    for (var i = 1; i <= fixed_dice_ticket.length; i++){
        document.getElementById("fixed"+i).value = fixed_dice_ticket[i-1]
    }
    document.getElementById("rollcount").value = total_roll_count
    document.getElementById("lapcount").value = total_laps
}




function resetGlobal(){
    current_cell = 0
    current_location_visit_count = [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]]
    fixed_dice_ticket = [0,0,0,0,0,0]
    total_roll_count = 0
    total_laps = 0
    lap_ticks = [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]]
}



function drawMovePin(){
    clearCanvas();
    ctx.drawImage(pinimg, locations[current_cell][0], locations[current_cell][1], PINSIZE[0], PINSIZE[1]);
}

function rollDice(){
    return Math.floor(random() * 6) + 1
}

function testDiceRoll(){
    count = [0,0,0,0,0,0]
    for(var i = 0; i < 10000; i++){
        count[rollDice()-1] += 1
    }
    console.log(count)
}

function calculate_rolls(){
    pbon = (parseFloat(document.getElementById("pbon").value) / 100.0) + 1.0
    total_ap = parseInt(document.getElementById("total_ap").value)

    firstclearap = 11*10 + 10*4 + 15*4 + 20*4
    firstclearshrimp = 50*11 + 150*3 + 300 + 225*3 + 525 + 900

    ap_left = total_ap - firstclearap 

    clearnum = ap_left / 20 

    shrimps = clearnum * (36 * pbon)

    total_shrimps = firstclearshrimp + shrimps 

    rolls = total_shrimps / 500

    console.log(ap_left)
    console.log(firstclearshrimp)

    document.getElementById("rolls").value = rolls
}

canvas.addEventListener('click', function(event) {
    console.log("[" + event.pageX + "," + event.pageY + "], ")
}, false);
