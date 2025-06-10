
export default function calculateDailyRation(weight, baseValue) {
    let firstJump = 4;
    let additiveJump = 11;
    let nextJump = firstJump + additiveJump;
    let totalRation = baseValue;

    for (let increasingWeight = 1; increasingWeight < weight; increasingWeight++) {
        if (increasingWeight === firstJump) {
            totalRation += baseValue * 2 / 3;
        } else if (increasingWeight === nextJump || 
                   (increasingWeight < firstJump + 3 && increasingWeight > firstJump)) {
            totalRation += baseValue * 2 / 3;
        } else if (increasingWeight === nextJump + 1) {
            totalRation += baseValue * 2 / 3;
        } else if (increasingWeight === nextJump + 2) {
            totalRation += baseValue * 2 / 3;
            nextJump += additiveJump;
        } else {
            totalRation += baseValue;
        }
    }

    return Math.round(totalRation);
}