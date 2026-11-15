export const FILE_INPUT_ID = 'eml-file-input'

/** Open the browser's file picker for an .eml file. */
export function openFilePicker() {
	document.getElementById(FILE_INPUT_ID)?.click()
}
