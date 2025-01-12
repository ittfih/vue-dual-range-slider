<template>
    <div class="container">
        <div class="slider-container">
            <div @mousedown="startDrag(Direction.Left)"
                :style="{ 'left': sliderTranslate[Direction.Left].value + '%', 'z-index': sliderTranslate[Direction.Left].value < 50 ? 1 : 3 }"
                class="slider">
                <div>||</div>
            </div>
            <div ref="secondaryBarRef" class="secondary-bar" :style="{ 'background-color': props.secondaryColor }"
                @click="handleBarClick(false, $event)">
            </div>
            <div :style="{ 'left': sliderTranslate[Direction.Left].value + '%', 'scale': barScale + ' 1', 'background-color': props.mainColor, }"
                class="main-bar" @click="handleBarClick(true, $event)">
            </div>

            <div @mousedown="startDrag(Direction.Right)"
                :style="{ 'left': + sliderTranslate[Direction.Right].value + '%' }" class="slider right-slider">||</div>
        </div>
        <div class="inupts-container">
            <input type="text" @keydown.enter="handleTextChange(visibleValues.left.value, Direction.Left)"
                @blur="handleTextChange(visibleValues.left.value, Direction.Left)" v-model="visibleValues.left.value"
                class="text-inputs left"
                :style="{ 'border-radius': props.inputRadius, 'background-color': props.inputBackgroundColor, 'color': props.inputTextColor }">
            <input type="text" @keydown.enter="handleTextChange(visibleValues.right.value, Direction.Right)"
                @blur="handleTextChange(visibleValues.right.value, Direction.Right)" v-model="visibleValues.right.value"
                class="text-inputs right"
                :style="{ 'border-radius': props.inputRadius, 'background-color': props.inputBackgroundColor, 'color': props.inputTextColor }">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Direction } from '../enums/Direction';
import { timeToString, stringToTimeUnit, stringToMiliseconds } from '../enums/TimeUnit';


const props = defineProps({
    minValue: { type: Number, default: 0 },
    maxValue: { type: Number, default: 100 },
    precision: { type: Number, default: 0 },

    dynamicEmit: { type: Boolean, default: true },

    timeMode: { type: Boolean, default: false },
    timeBaseUnit: { type: String, default: 'second' },
    timeSmallestShownUnit: { type: String, default: 'second' },
    timeAlwaysShownUnit: { type: String, default: 'minute' },

    startingMinValue: { type: [Number, null], defualt: null },
    startingMaxValue: { type: [Number, null], default: null },

    mainColor: { type: String, default: "#a3e635" },
    secondaryColor: { type: String, default: "#94a3b8" },

    inputRadius: { type: String, default: "5px" },
    inputBackgroundColor: { type: String, default: "white" },
    inputTextColor: { type: String, default: "black" },
})


type EmitEvents = {
    (event: 'changed', value: [number, number]): void;
};

const emit = defineEmits<EmitEvents>();

const secondaryBarRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const currentDrag = ref(Direction.Left)
const barTranslate = ref('0%')
const barScale = ref(1)

const valuesRange = props.maxValue - props.minValue

const sliderTranslate = {
    left: ref(0),
    right: ref(100)
}

const trueValues = {
    left: ref(props.minValue),
    right: ref(props.maxValue)
}

const visibleValues = {
    left: ref<number | string>(props.minValue),
    right: ref<number | string>(props.maxValue)
}

onMounted(() => {
    setStartingValues()
    updateTranslations()
    emitValues()
    convertToShownValue(Direction.Left)
    convertToShownValue(Direction.Right)
})

const setStartingValues = () => {
    if (props.startingMinValue != null && Number.isFinite(props.startingMinValue)) {
        trueValues[Direction.Left].value = Math.max(props.minValue, Math.min(props.startingMinValue, props.maxValue))
    }
    if (props.startingMaxValue != null && Number.isFinite(props.startingMaxValue)) {
        trueValues[Direction.Right].value = Math.max(trueValues[Direction.Left].value, Math.min(props.startingMaxValue, props.maxValue))
    }
}

const handleTextChange = (newValue: number | string, direction: Direction) => {
    let newValueConverted = convertTimeToNumber(newValue)
    if (newValueConverted == null) return
    setTrueValue(newValueConverted, direction)
}

const startDrag = (side: Direction) => {
    isDragging.value = true;
    currentDrag.value = side;

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
}

const onDrag = (event: MouseEvent) => {
    if (!isDragging.value) return;

    const rect = secondaryBarRef.value?.getBoundingClientRect()
    if (rect == null) return;

    if (currentDrag.value === Direction.Left) {
        sliderTranslate[Direction.Left].value = Math.max(0, Math.min((event.clientX - rect?.left) * (100 / rect.width), sliderTranslate[Direction.Right].value))
        setTrueValue(translationToValue(Direction.Left), Direction.Left)
    }
    else if (currentDrag.value === Direction.Right) {
        sliderTranslate[Direction.Right].value = Math.max(sliderTranslate[Direction.Left].value, Math.min((event.clientX - rect.left) * (100 / rect.width), 100))
        setTrueValue(translationToValue(Direction.Right), Direction.Right)
    }
}

const stopDrag = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    if (!props.dynamicEmit) emitValues()
}

const updateTranslations = () => {
    sliderTranslate[Direction.Left].value = 100 * (trueValues.left.value - props.minValue) / valuesRange;
    sliderTranslate[Direction.Right].value = 100 * (trueValues.right.value - props.minValue) / valuesRange;
    updateBar()
}

const translationToValue = (direction: Direction) => {
    const opertatedValue = direction == Direction.Left ? sliderTranslate[Direction.Left].value : sliderTranslate[Direction.Right].value
    const output = (opertatedValue / 100 * valuesRange) + props.minValue
    return output
}

const updateBar = () => {
    barTranslate.value = String(trueValues.left.value / valuesRange) + "%"
    barScale.value = (trueValues.right.value - trueValues.left.value) / valuesRange
}

const emitValues = () => {
    emit('changed', [trueValues.left.value, trueValues.right.value])
}

const convertToShownValue = (direction: Direction) => {
    if (props.timeMode == false)
        visibleValues[direction].value = Number(trueValues[direction].value).toFixed(props.precision)
    else
        visibleValues[direction].value = timeToString(trueValues[direction].value, stringToTimeUnit(props.timeBaseUnit), stringToTimeUnit(props.timeSmallestShownUnit), stringToTimeUnit(props.timeAlwaysShownUnit))
}

const convertTimeToNumber = (time: number | string) => {
    if (props.timeMode == false) return Number(time)
    return stringToMiliseconds(String(time))
}

const handleBarClick = (considerBarScale: boolean, event: MouseEvent) => {
    const clickPositionX = event.offsetX
    const element = event.currentTarget as HTMLElement
    const maxPossibleClickPositionX = element.clientWidth

    const absDiffrenceLeft = Math.abs(trueValues.left.value / valuesRange - clickPositionX / maxPossibleClickPositionX)
    const absDiffrenceRight = Math.abs(trueValues.right.value / valuesRange - clickPositionX / maxPossibleClickPositionX)

    if (considerBarScale) {
        if (absDiffrenceLeft > absDiffrenceRight)
            setTrueValue(trueValues.right.value - (valuesRange - (valuesRange * clickPositionX / maxPossibleClickPositionX)) * barScale.value, Direction.Right)
        else
            setTrueValue(trueValues.left.value + (valuesRange * clickPositionX / maxPossibleClickPositionX) * barScale.value, Direction.Left)

    }
    else {
        const newValue = valuesRange * clickPositionX / maxPossibleClickPositionX
        if (absDiffrenceLeft > absDiffrenceRight)
            setTrueValue(newValue + props.minValue, Direction.Right)
        else if (absDiffrenceLeft < absDiffrenceRight)
            setTrueValue(newValue + props.minValue, Direction.Left)
        else if (absDiffrenceLeft == absDiffrenceRight) {
            if (newValue + props.minValue < trueValues.left.value) setTrueValue(newValue + props.minValue, Direction.Left)
            else setTrueValue(newValue + props.minValue, Direction.Right)
        }
    }
}

const setTrueValue = (value: number, direction: Direction) => {
    if (!Number.isFinite(value)) return
    if (direction == Direction.Left) {
        trueValues[direction].value = Number(Math.max(props.minValue, Math.min(value, trueValues[Direction.Right].value)))
    }
    else {
        trueValues[direction].value = Number(Math.min(props.maxValue, Math.max(value, trueValues[Direction.Left].value)))
    }
    trueValues[direction].value = Number(trueValues[direction].value.toFixed(props.precision))
    updateTranslations()
    if (props.dynamicEmit || !isDragging.value) emitValues()
}

const setMin = (value: number) => {
    setTrueValue(value, Direction.Left)
}

const setMax = (value: number) => {
    setTrueValue(value, Direction.Right)
}

const resetValues = () => {
    if (props.startingMinValue)
        setTrueValue(props.startingMinValue, Direction.Left)
    else
        setTrueValue(props.minValue, Direction.Left)

    if (props.startingMaxValue)
        setTrueValue(props.startingMaxValue, Direction.Right)
    else
        setTrueValue(props.maxValue, Direction.Right)
}

defineExpose({ setMin, setMax, resetValues })

watch(trueValues.left, async () => {
    convertToShownValue(Direction.Left)
})

watch(trueValues.right, async () => {
    convertToShownValue(Direction.Right)
})

</script>

<style scoped>
div {
    box-sizing: content-box;
}

.container {
    width: 100%;
    height: 100%;

}

.relative {
    position: relative;
}

.slider {
    background-color: white;
    border: 2px;
    width: 36px;
    height: 28px;
    position: relative;
    display: flex;
    user-select: none;
    text-align: center;
    border-radius: 0.375rem;
    border-style: solid;
    border-color: #94a3b8;
    transform: translate(-50%, 0%);
    justify-content: center;
    align-items: center;
}

.right-slider {
    z-index: 2;
    transform: translateY(-200%) translateX(-50%);
}

.main-bar {
    width: 100%;
    position: relative;
    height: 16px;
    transform-origin: left;
    translate: 0 -250%
}

.secondary-bar {
    width: 100%;
    border-radius: 0.375rem;
    position: relative;
    height: 16px;
    transform: translateY(-150%);
}

.slider-container {
    position: relative;
    color: rgb(156 163 175);
    padding-left: 18px;
    padding-right: 18px;
    width: calc(100% - 36px);
    height: 40px;
}

.text-inputs {
    box-sizing: border-box;
    position: absolute;
    width: 30%;
    height: 100%;
    padding: 12px;
    border: 1px;
    border-style: solid;
    border-color: rgb(148 163 184);
    border-radius: 5px;
}

.inupts-container {
    height: 42px;
    position: relative;
}

.left {
    left: 0%;
    bottom: 0%;
}

.right {
    right: 0%;
    bottom: 0%;
}
</style>