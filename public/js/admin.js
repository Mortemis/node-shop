const deleteProduct = async (btn) => {
    const _id = btn.parentNode.querySelector('[name=id]').value;
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;

    const prodElem = btn.closest('article');

    try {
        const data = await fetch(`/admin/product/${_id}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrfToken
            }
        });
        console.log(await data.json());
        prodElem.remove();
    } catch (err) {
        console.log(err);
    }
};