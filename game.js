const crypto = require('crypto');
const prompt = require("prompt-sync")();
const Table = require('cli-table3');

//Input Validation
const args = process.argv.slice(2);
if (args.length < 3) {
    console.error("Error: At least 3 dice are required.");
    process.exit(1);
}
const dice = args.map((arg, i) => {
    const faces = arg.split(",").map(Number);
    if (faces.length !== 6) {
        console.error(`Error: Dice ${i + 1} must have exactly 6 values.`);
        process.exit(1);
    }
    if (faces.some(n => !Number.isInteger(n))) {
        console.error(`Error: Dice ${i + 1} contains non-integer values.`);
        process.exit(1);
    }
    return faces;
});
const diceCount = dice.length;
let systemDice = [], playerDice = [], systemResult, playerResult;

//Game Functions
function generateHMACValue(min, max) {
    const number = crypto.randomInt(min, max + 1);  // Inclusive max
    const key = crypto.randomBytes(32);             // 256-bit secret key
    const hmac = crypto.createHmac('sha3-256', key).update(String(number)).digest('hex');
    return [number, key.toString('hex'), hmac];
}
function show_help() {
    console.log("Help:\n- Choose a dice not selected by the system.\n- Use 0-5 for rolling.\n- 'x' to exit, 'h' for help.");
    process.exit();
}
function fair_roll(die, label) {
    const [number, key, hmac] = generateHMACValue(0, 5);
    console.log(`I selected a random value in the range 0..5 (HMAC=${hmac}).`);
    console.log("Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nx - exit\nh - help");

    const input = prompt("Your selection: ");
    if (input === "x") process.exit();
    if (input === "h") show_help();

    const playerValue = Number(input);
    const index = (number + playerValue) % 6;
    console.log(`My number is ${number} (KEY=${key}).`);
    console.log(`The fair number generation result is: (${number} + ${playerValue}) % 6 = ${index}`);
    console.log(`${label} roll result is ${die[index]}`);
    return die[index];
}
function player_dice_select() {
    console.log("It's your turn, choose your dice:");
    let i = 0;
    dice.forEach(d => {
        if (d !== systemDice) {
            console.log(`${i} - ${d}`);
            i++;
        }
    });
    console.log("x - exit\nh - help");
    const input = prompt("Your selection: ");
    if (input === "x") process.exit();
    if (input === "h") show_help();

    const index = Number(input);
    playerDice = (dice[index] !== systemDice) ? dice[index] : dice[index + 1];
    console.log("You chose the", playerDice, "dice.");
}
function system_dice_select() {
    while (true) {
        let randIndex = crypto.randomInt(0, diceCount);
        if (dice[randIndex] !== playerDice) {
            systemDice = dice[randIndex];
            break;
        }
    }
    console.log("It's my turn and I choose the", systemDice, "dice");
}


//help
function calculateWinProbability(dieA, dieB) {
    let wins = 0;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (dieA[i] > dieB[j]) wins++;
        }
    }
    return (wins / 36).toFixed(4);
}
function show_help() {
    console.log("Help:\n- Choose a dice not selected by the system.");
    console.log("- Use 'x' to exit the game or 'h' to show this help.\n");

    console.log("Probability of the win for the user:\n");

    const table = new Table({
        head: ['User dice v', ...dice.map(d => d.join(','))],
        style: { head: ['cyan'] }
    });

    dice.forEach((dieA, i) => {
        const row = [dieA.join(',')];
        dice.forEach((dieB, j) => {
            if (i === j) {
                row.push('   -   ');
            } else {
                const prob = calculateWinProbability(dieA, dieB);
                row.push(prob);
            }
        });
        table.push(row);
    });

    console.log(table.toString());
    process.exit();
}

// Toss & Game
const [tossValue, tossKey, tossHmac] = generateHMACValue(0, 1);
console.log(`Let's determine who makes the first move.\nI selected a random value in the range 0..1 (HMAC=${tossHmac}).`);
console.log("Try to guess my selection.\n0 - 0\n1 - 1\nx - exit\nh - help");

const guess = prompt("Your selection: ");
if (guess === "x") process.exit();
if (guess === "h") show_help();

console.log(`My selection: ${tossValue} (key=${tossKey}).`);

if (Number(guess) === tossValue) {
    player_dice_select();
    system_dice_select();
    console.log("It's time for your roll.");
    playerResult = fair_roll(playerDice, "Your");
    console.log("It's time for my roll.");
    systemResult = fair_roll(systemDice, "My");
} else {
    system_dice_select();
    player_dice_select();
    console.log("It's time for my roll.");
    systemResult = fair_roll(systemDice, "My");
    console.log("It's time for your roll.");
    playerResult = fair_roll(playerDice, "Your");
}
// Game Result
if (systemResult > playerResult) {
    console.log(`You lose (${systemResult} > ${playerResult})!`);
} else if (systemResult < playerResult) {
    console.log(`You win (${systemResult} < ${playerResult})!`);
} else {
    console.log(`It's a draw (${systemResult} = ${playerResult})!`);
}
