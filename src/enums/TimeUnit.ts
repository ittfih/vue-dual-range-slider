export enum TimeUnit {
    Millisecond = 1, // 1 ms
    Second = 1000, // 100 ms
    Minute = 60000, // 100 * 60 ms
    Hour = 3600000, // 100 * 60 * 60 ms
    Day = 86400000, // 100 * 60 * 60 * 24 ms
}

const enumAsArray = [TimeUnit.Millisecond, TimeUnit.Second, TimeUnit.Minute, TimeUnit.Hour, TimeUnit.Day]


/**
 * Converts numeric value to string representing time
 * @param {number} timeValue numeric value of value to convert
 * @param {TimeUnit} type gives information what type of unit is timeValue
 * @param {TimeUnit} smallestUnit represents smallest time unit shown in outuput
 * @param {TimeUnit} highestUnit represnts highest time unit shown in output
 */
export function timeToString(timeValue: number, baseUnit: number = TimeUnit.Second, smallestUnit: number = TimeUnit.Second, highestUnit: number = TimeUnit.Hour) {
    let milliseconds = timeValue * baseUnit
    let result = "";
    if (smallestUnit <= TimeUnit.Day) [milliseconds, result] = millisecondsToRemainingTimeAndString(milliseconds, TimeUnit.Day, highestUnit, result);
    if (smallestUnit <= TimeUnit.Hour) [milliseconds, result] = millisecondsToRemainingTimeAndString(milliseconds, TimeUnit.Hour, highestUnit, result);
    if (smallestUnit <= TimeUnit.Minute) [milliseconds, result] = millisecondsToRemainingTimeAndString(milliseconds, TimeUnit.Minute, highestUnit, result);
    if (smallestUnit <= TimeUnit.Second) [milliseconds, result] = millisecondsToRemainingTimeAndString(milliseconds, TimeUnit.Second, highestUnit, result);
    if (smallestUnit <= TimeUnit.Millisecond) [milliseconds, result] = millisecondsToRemainingTimeAndString(milliseconds, TimeUnit.Millisecond, highestUnit, result);
    result = result.substring(0, result.length - 1)
    return result
}

export function stringToMiliseconds(time: string): number | null {
    let result = 0
    const splitedTime = time.split(":")
    let currentTimeUnit = splitedTime[splitedTime.length - 1].length == 3 && splitedTime.length > 1 ? 0 : 1
    for (let i = splitedTime.length - 1; i >= 0; i--) {
        if (isNaN(Number(splitedTime[i]))) return null
        result += Number(splitedTime[i]) * enumAsArray[currentTimeUnit]
        currentTimeUnit++
    }
    return result
}

export function stringToTimeUnit(value: string): TimeUnit {
    switch (value.toLocaleLowerCase()) {
        case '1':
        case 'ms':
        case 'millisecond':
            return TimeUnit.Millisecond
        case '2':
        case 's':
        case 'second':
            return TimeUnit.Second
        case '3':
        case 'm':
        case 'minute':
            return TimeUnit.Minute
        case '4':
        case 'h':
        case 'hour':
            return TimeUnit.Hour
        case '5':
        case 'd':
        case 'day':
            return TimeUnit.Day
        default:
            return TimeUnit.Second
    }
}

function millisecondsToRemainingTimeAndString(milliseconds: number, convertToThisUnit: TimeUnit, alwaysShownUnit: TimeUnit, stringToEdit: string): [number, string] {
    const wholeUnits = Number((milliseconds / convertToThisUnit)) | 0
    milliseconds -= wholeUnits * convertToThisUnit
    stringToEdit = padZeroes(convertToThisUnit, wholeUnits, alwaysShownUnit, stringToEdit)
    return [milliseconds, stringToEdit]
}

function padZeroes(timeUnit: TimeUnit, numberToPad: number, alwaysShownUnit: TimeUnit, newString: string): string {
    if (numberToPad == 0 && newString == '' && timeUnit != alwaysShownUnit) return ''
    switch (timeUnit) {
        case TimeUnit.Millisecond:
            if (numberToPad < 10) return `${newString}00${numberToPad}:`
            if (numberToPad < 100) return `${newString}0${numberToPad}:`
            break
        case TimeUnit.Second:
            if (numberToPad < 10) return `${newString}0${numberToPad}:`
            break
        case TimeUnit.Minute:
            if (numberToPad < 10) return `${newString}0${numberToPad}:`
            break
        case TimeUnit.Hour:
            if (numberToPad < 10) return `${newString}0${numberToPad}:`
            break
        case TimeUnit.Day:
            break
    }
    return `${newString}${numberToPad}:`
}