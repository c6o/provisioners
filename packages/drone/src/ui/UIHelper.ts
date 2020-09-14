

const inputChanged = (spec, field) => (e) => {
    if(e.detail && e.detail !== 0) {
        //checkbox
        spec[field] = e.detail.value
    } else {
        //text-field
        spec[field] = e.target.value
    }
    console.log(field, spec[field])
}

export { inputChanged }