function edit(button) {
    let row = button.parentElement.parentElement;
    let cells = row.getElementsByTagName("td");
    for (let i = 1; i < cells.length - 1; i++) {
        let input = document.createElement("input");
        input.value = cells[i].innerText;
        cells[i].innerText = "";
        cells[i].appendChild(input);
    }
    button.innerText = "保存";
    button.setAttribute("onclick", "ApplyChange(this)");
}

function ApplyChange(button) {
    let row = button.parentElement.parentElement;
    let cells = row.getElementsByTagName("td");
    for (let i = 1; i < cells.length - 1; i++) {
        let input = cells[i].children[0];
        cells[i].innerText = input.value;
    }
    button.innerText = "編輯";
    button.setAttribute("onclick", "edit(this)");
}

function Delete(button) {
    let row = button.parentElement.parentElement;
    row.parentElement.removeChild(row);
}

function add() {
    let tableBody = document.getElementById("tableBody");
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><button class="edit-button" onclick="edit(this)">編輯</button></td>
        <td><input type="text" placeholder="品項"></td>
        <td><input type="text" placeholder="保存期限"></td>
        <td><input type="text" placeholder="備註"></td>
        <td><button class="delete-button" onclick="delete(this)">刪除</button></td>
    `;
    tableBody.appendChild(newRow);
}
