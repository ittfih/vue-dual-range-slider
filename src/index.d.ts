import { defineComponent, type DefineComponent } from "vue";

declare module 'vue-dual-range-slider' {
    export const VueDualRangeSlider: DefineComponent<{
        minValue: Number,
        maxValue: Number,
        precision: Number,
        dynamicEmit: Boolean,
        timeMode: Boolean,
        timeBaseUnit: String,
        timeSmallestShownUnit: String,
        timeAlwaysShownUnit: String,
        startingMinValue: Number | null,
        startingMaxValue: Number | null,
        mainColor: String,
        secondaryColor: String,
        inputRadius: String,
        inputBackgroundColor: String,
        inputTextColor: String,
    }>
}