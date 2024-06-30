var customData = {
    teams: [
        [{ name: "Team 1" }, { name: "Team 2" }],
        [{ name: "Team 3" }, { name: "Team 4" }]
    ],
    results: []
};

function edit_fn(container, data, doneCb) {
    var input = $('<input type="text">');
    input.val(data ? data.name : ''); // Set input value to current name if data exists
    container.html(input);
    input.focus();
    input.blur(function() {
        var inputValue = input.val();
        if (inputValue.length === 0) {
            doneCb(null); // If input is empty, pass null to doneCb
        } else {
            doneCb({ name: inputValue }); // Pass an object with the updated name to doneCb
        }
    });
}

function render_fn(container, data, score, state) {
    switch (state) {
        case "empty-bye":
            container.append("No team");
            return;
        case "empty-tbd":
            container.append("Upcoming");
            return;
        case "entry-no-score":
            container.append(data.name);
            return;
        case "entry-default-win":
            container.append(data.name + " (Default Win)");
            return;
        case "entry-complete":
            var medal = getMedal(score);
            container.append('<span class="medal">' + medal + '</span> ' + data.name);
            return;
    }
}

// Function to determine medal based on score
function getMedal(score) {
    if (score === 1) {
        return "<i class='fas fa-medal gold'></i>"; // Gold medal
    } else if (score === 2) {
        return "<i class='fas fa-medal silver'></i>"; // Silver medal
    } else if (score === 3) {
        return "<i class='fas fa-medal bronze'></i>"; // Bronze medal
    } else {
        return ""; // Default case
    }
}


function initializeBracket(element, bracketData) {
    $(element).bracket({
        init: bracketData,
        save: function() {},
        decorator: { edit: edit_fn, render: render_fn }
    });
}

$(function() {
    // Initialize existing brackets
    $('.my_gracket').each(function() {
        var bracketId = $(this).closest('.bracket-container').data('bracket-id');
        initializeBracket(this, customData);
    }); 

    // Add new bracket functionality
    $('#add-bracket').on('click', function() {
        var bracketCount = $('.bracket-container').length + 1;
        var newBracket =
            `<div class="bracket-container" data-bracket-id="${bracketCount}">
                <h2 class="bracket-title" contenteditable="true">Bracket ${bracketCount} Title</h2>
                <div class="my_gracket"></div>
            </div>`;
        $('#brackets').append(newBracket);
        initializeBracket($('.bracket-container[data-bracket-id="' + bracketCount + '"] .my_gracket'), customData);
    });
});
