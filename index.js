$(document).ready(function() {
    var tournamentCount = 0; // Counter for tournaments
    var tournamentsData = []; // Array to store all tournaments data
    var medalsData = {
        gold: 0,
        silver: 0,
        bronze: 0
    }; // Object to store medals count

    // Function to create a new tournament
    $('#addTournament').click(function() {
        tournamentCount++; // Increment tournament counter
        var tournamentTitle = $('#tournamentTitle').val().trim();
        if (tournamentTitle === '') {
            alert('Vui lòng nhập nội dung sigma.'); // Alert if tournament title is empty
            return;
        }

        // Structure of a new tournament data object
        var newTournamentData = {
            id: tournamentCount,
            title: tournamentTitle,
            teams: [
                [{ name: "VĐV " + (tournamentCount * 2 - 1) }, { name: "VĐV " + (tournamentCount * 2) }],
                [{ name: "VĐV " + (tournamentCount * 2 + 1) }, { name: "VĐV " + (tournamentCount * 2 + 2) }]
            ],
            results: [
                [], // Winner bracket
                []  // Loser bracket
            ]
        };

        createTournament(newTournamentData); // Call function to create tournament
        tournamentsData.push(newTournamentData); // Add new tournament data to array
        saveTournamentsToStorage(); // Save tournaments data to localStorage
        $('#tournamentTitle').val(''); // Clear input field after adding tournament

        updateStatistics(); // Update statistics on the interface
        updateMedalsStatistics(); // Update medals statistics on the interface
        displayResults(newTournamentData); // Display the results for the new tournament
    });

    // Function to create a tournament in DOM and initialize with jquery-bracket
    function createTournament(tournamentData) {
        var tournamentDiv = $('<div class="my_gracket" id="tournament_' + tournamentData.id + '"></div>'); // Create tournament div
        var titleInput = $('<h2>').text(tournamentData.title); // Create tournament title element

        // Buttons for edit and delete tournament
        var editButton = $('<button>').html('<i class="fas fa-edit"></i>').click(function() {
            var newTitle = prompt('Nhập tiêu đề mới:', tournamentData.title); // Prompt for new title
            if (newTitle !== null) {
                tournamentData.title = newTitle; // Update tournament title
                titleInput.text(newTitle); // Update title text in DOM
                saveTournamentsToStorage(); // Save updated data
                updateStatistics(); // Update statistics on the interface
                updateMedalsStatistics(); // Update medals statistics on the interface
            }
        });

        var deleteButton = $('<button>').html('<i class="fas fa-trash-alt"></i>').click(function() {
            if (confirm('Bạn có chắc chắn muốn xóa nội dung sigma này?')) {
                $('#tournament_' + tournamentData.id).remove(); // Remove tournament from DOM
                titleInput.remove(); // Remove title element
                tournamentsData = tournamentsData.filter(t => t.id !== tournamentData.id); // Remove tournament data from array
                saveTournamentsToStorage(); // Save updated data
                updateStatistics(); // Update statistics on the interface
                updateMedalsStatistics(); // Update medals statistics on the interface
            }
        });

        // Append tournament title with edit and delete buttons
        $('#tournaments').append(titleInput.append(editButton).append(deleteButton)).append(tournamentDiv);

        // Initialize jquery-bracket for the tournament
        tournamentDiv.bracket({
            init: tournamentData,
            save: function(updatedData) {
                tournamentData.teams = updatedData.teams; // Update teams data on save
                tournamentData.results = updatedData.results; // Update results data on save
                saveTournamentsToStorage(); // Save updated data
            },
            decorator: {edit: edit_fn, render: render_fn}, // Custom decorator functions
            teamWidth: 300 // Width for teams in bracket view
        });

    }

    // Function for editing team names in bracket view
    function edit_fn(container, data, doneCb) {
        var input = $('<input type="text" placeholder="Team Name">'); // Input field for team name editing
        input.val(data ? data.name : ''); // Pre-fill input with current team name
        container.empty().append(input); // Replace container content with input element
        input.focus().blur(function() {
            var inputValue = input.val();
            if (inputValue.length === 0) {
                doneCb(null);
            } else {
                doneCb({ name: inputValue });
                var tournamentId = container.closest('.my_gracket').attr('id'); // Get tournament ID safely
                if(tournamentId) {
                    updateTeamName(tournamentId, data.name, inputValue); // Update team name
                } else {
                    console.error('Cannot find tournamentId for the team name update.');
                }
            }
        });
        updateStatistics();
        updateMedalsStatistics();
    }

    // Function for rendering team names in bracket view
    function render_fn(container, data, score, state) {
        var text = '';
        switch (state) {
            case "empty-bye":
                text = "No team";
                break;
            case "empty-tbd":
                text = "Upcoming";
                break;
            case "entry-no-score":
            case "entry-default-win":
            case "entry-complete":
                text = data.name; // Display team name
                break;
            case "draw":
                text = "Draw";
                break;
            default:
        }
        container.text(text); // Set text content of container
        updateStatistics();
        updateMedalsStatistics();
    }

    // Function to update team name in tournament data
    function updateTeamName(tournamentId, oldName, newName) {
        if (!tournamentId || !tournamentId.includes('_')) {
            console.error('Invalid tournamentId:', tournamentId);
            return;
        }
        
        var tournament = tournamentsData.find(t => t.id === parseInt(tournamentId.split('_')[1]));
        if (!tournament) {
            console.error('Tournament not found for id:', tournamentId);
            return;
        }
    
        tournament.teams.forEach(match => {
            match.forEach(team => {
                if (team.name === oldName) {
                    team.name = newName; // Update team name
                }
            });
        });
        saveTournamentsToStorage(); // Save updated data
        updateStatistics();
        updateMedalsStatistics();
    }

    // Function to save tournaments data to localStorage
    function saveTournamentsToStorage() {
        localStorage.setItem('tournamentsData', JSON.stringify(tournamentsData)); // Convert data to JSON and save
    }

    // Function to update statistics based on tournaments data
    function updateStatistics() {
        let totalTournaments = tournamentsData.length; // Calculate total tournaments

        // Update statistics on the interface
        $('#totalTournaments').text(totalTournaments);
    }

    // Function to update medals statistics based on tournaments data
    function updateMedalsStatistics() {
        // Reset medals count
        medalsData.gold = 0;
        medalsData.silver = 0;
        medalsData.bronze = 0;

        // Count medals based on tournament results
        tournamentsData.forEach(tournament => {
            tournament.results.forEach(result => {
                if (result.first) {
                    medalsData.gold++;
                } else if (result.second) {
                    medalsData.silver++;
                } else if (result.third) {
                    medalsData.bronze++;
                }
            });
        });

        // Update medals statistics on the interface
        $('#goldMedals').text(medalsData.gold);
        $('#silverMedals').text(medalsData.silver);
        $('#bronzeMedals').text(medalsData.bronze);
    }

    // Ensure initial statistics are updated on page load
    updateStatistics();
    updateMedalsStatistics();

    // Function to load tournaments data from localStorage on page load
    function loadTournamentsFromStorage() {
        var storedTournaments = localStorage.getItem('tournamentsData'); // Retrieve data from localStorage
        if (storedTournaments) {
            tournamentsData = JSON.parse(storedTournaments); // Parse JSON string to object
            tournamentsData.forEach(function(tournament) {
                createTournament(tournament); // Create tournaments in DOM based on loaded data
            });
            tournamentCount = tournamentsData.length; // Update tournament count
        }
    }

    // Load existing tournaments from localStorage on page load
    loadTournamentsFromStorage();
    updateStatistics();
    updateMedalsStatistics();

    // Function to display tournament results
    function displayResults(tournamentData) {
        var $winnerBracket = $('#winnerBracket').empty();
        var $loserBracket = $('#loserBracket').empty();

        // Display results for Winner Bracket
        tournamentData.results[0].forEach(function(result, index) {
            $winnerBracket.append('<p>Match ' + (index + 1) + ': ' + result[0] + ' vs ' + result[1] + '</p>');
        });

        // Display results for Loser Bracket
        tournamentData.results[1].forEach(function(result, index) {
            $loserBracket.append('<p>Match ' + (index + 1) + ': ' + result[0] + ' vs ' + result[1] + '</p>');
        });
    }
});
