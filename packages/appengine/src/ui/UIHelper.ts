const inputChanged = (spec, field) => (e) => {
    spec[field] = e.detail && e.detail !== 0 ? e.detail.value : e.target.value
}

export { inputChanged }