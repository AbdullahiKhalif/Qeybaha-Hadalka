$(document).ready(function() {
    // Initial data fetch and select options population
    fetchEraygaHadalka();
    fetchSelectOptions();

    // Function to fetch all Erayga Hadalka records and populate the table
    function fetchEraygaHadalka() {
        $.ajax({
            url: '/readAllErayga',
            method: 'GET',
            success: function(data) {
                let tbody = '';
                data.forEach(function(item, index) {
                    tbody += `<tr>
                        <td>${index + 1}</td>
                        <td>${item.Asalka_erayga_name}</td>
                        <td>${item.Qeybta_hadalka_name}</td>
                        <td>${item.Erayga}</td>
                        <td>
                            <button class="btn btn-primary btn-md edit-item" data-id="${item.Aqoonsiga_erayga}"><i class="fa fa-edit"></i></button>
                            <button class="btn btn-danger btn-md delete-item" data-id="${item.Aqoonsiga_erayga}"><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>`;
                });
                $('#eraygaTable tbody').html(tbody);
            },
            error: function(error) {
                console.error('Error fetching Erayga Hadalka:', error);
            }
        });
    }

    // Function to fetch select options for Qeybta Hadalka
    function fetchSelectOptions() {
        $.get('/readAll', function(data) {
            let options = '<option value="0">Choose Part of Speech</option>';
            data.forEach(item => {
                options += `<option value="${item.Aqoonsiga_hadalka}">${item.Qaybta_hadalka} (${item.Loo_gaabsho})</option>`;
            });
            $('#Qeybta_hadalka, #editQeybta_hadalka').html(options);
        });
    }

    // Show the Add Modal when the add button is clicked
    $('#addNewErayga').click(function() {
        $('#addEraygaForm')[0].reset();
        fetchAsalkaOptionsForUser(); // Fetch options specific to the current user
        $('#addEraygaModal').modal('show');
    });

    // Function to fetch Asalka Erayga options for the current user
    function fetchAsalkaOptionsForUser() {
        $.get('/readAllAsalka', function(response) {
            let options = '<option value="0">Choose Root Words</option>';
            response.data.forEach(item => {
                options += `<option value="${item.Aqonsiga_Erayga}">${item.Erayga_Asalka}</option>`;
            });
            $('#Asalka_erayga').html(options);
            $('#total_records').text(response.total_records); // Update the total records count if applicable
        }).fail(function(error) {
            console.error('Error fetching Asalka Erayga options:', error);
        });
    }

    // Handle form submission for adding new Erayga Hadalka
    $('#addEraygaForm').submit(function(event) {
        event.preventDefault();
        const formDataObject = {};

        var eraygaInput = $("#Erayga").val();
        var noocaErayga = $("#Nooca_erayga").val();
        var qeybtaHadalka = $("#Qeybta_hadalka").val();
        var asalkaErayga = $("#Asalka_erayga").val();

        // Validate form inputs
        if (eraygaInput.trim() === "") {
            Swal.fire('Error', 'Erayga is required. Please enter a value.', 'error');
            return;
        }
        if (noocaErayga === "0") {
            Swal.fire('Error', 'Nooca Erayga is required. Please select a valid option.', 'error');
            return;
        }
        if (qeybtaHadalka === "0") {
            Swal.fire('Error', 'Qeybta Hadalka is required. Please select a valid option.', 'error');
            return;
        }
        if (asalkaErayga === "0") {
            Swal.fire('Error', 'Asalka Erayga is required. Please select a valid option.', 'error');
            return;
        }

        // Split the Erayga input by comma or space to get multiple words
        let eraygaWords = eraygaInput.split(/[,\s]+/).filter(word => word.trim() !== "");

        if (eraygaWords.length === 0) {
            Swal.fire('Error', 'Please enter valid words for Erayga.', 'error');
            return;
        }

        // Prepare the form data for each word
        const requests = eraygaWords.map(word => {
            const newWordData = {
                Erayga: word.trim(),
                Nooca_erayga: noocaErayga,
                Qeybta_hadalka: qeybtaHadalka,
                Asalka_erayga: asalkaErayga
            };
            return $.ajax({
                url: '/createErayga',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newWordData)
            });
        });

        // Send all requests and handle the response
        Promise.all(requests)
            .then(function() {
                $('#addEraygaModal').modal('hide');
                fetchEraygaHadalka();
                Swal.fire('Success', `${eraygaWords.length} words inserted successfully`, 'success');
            })
            .catch(function(xhr) {
                Swal.fire('Error', xhr.responseJSON.error || 'Failed to save Erayga Hadalka', 'error');
            });
    });

    // Show the Edit Modal with pre-filled data
    $(document).on('click', '.edit-item', function() {
        const itemId = $(this).data('id');
        $.get(`/readInfoErayga/${itemId}`, function(data) {
            $('#editAqoonsiga_erayga').val(data.erayga_data.Aqoonsiga_erayga);
            $('#editErayga').val(data.erayga_data.Erayga);
            $('#editNooca_erayga').val(data.erayga_data.Nooca_erayga);
            $('#editQeybta_hadalka').val(data.erayga_data.Qeybta_hadalka);
            $('#editAsalka_erayga').val(data.erayga_data.Asalka_erayga);

            // Populate Asalka Erayga options in the edit modal
            let asalkaOptions = '';
            data.asalka_options.forEach(function(option) {
                asalkaOptions += `<option value="${option.Aqonsiga_Erayga}" ${option.Aqonsiga_Erayga == data.erayga_data.Asalka_erayga ? 'selected' : ''}>${option.Erayga_Asalka}</option>`;
            });
            $('#editAsalka_erayga').html(asalkaOptions);

            $('#editEraygaModal').modal('show');
        }).fail(function(error) {
            console.error('Error fetching Erayga Hadalka details:', error);
        });
    });

    // Handle form submission for editing Erayga Hadalka
    $('#editEraygaForm').submit(function(event) {
        event.preventDefault();
        const itemId = $('#editAqoonsiga_erayga').val();
        const formDataObject = {};

        var noocaErayga = $("#editNooca_erayga").val();
        var qeybtaHadalka = $("#editQeybta_hadalka").val();
        var asalkaErayga = $("#editAsalka_erayga").val();

        // Validate form inputs
        if (noocaErayga === "0") {
            Swal.fire('Error', 'Nooca Erayga is required. Please select a valid option.', 'error');
            return;
        }
        if (qeybtaHadalka === "0") {
            Swal.fire('Error', 'Qeybta Hadalka is required. Please select a valid option.', 'error');
            return;
        }
        if (asalkaErayga === "0") {
            Swal.fire('Error', 'Asalka Erayga is required. Please select a valid option.', 'error');
            return;
        }

        // Serialize form data to JSON
        $(this).serializeArray().forEach(field => {
            formDataObject[field.name] = field.value;
        });

        $.ajax({
            url: `/updateErayga/${itemId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formDataObject),
            success: function(data) {
                $('#editEraygaModal').modal('hide');
                fetchEraygaHadalka();
                Swal.fire('Success', data.message, 'success');
            },
            error: function(xhr) {
                Swal.fire('Error', xhr.responseJSON.error || 'Failed to update Erayga Hadalka', 'error');
            }
        });
    });

    // Handle deleting Erayga Hadalka
    $(document).on('click', '.delete-item', function() {
        const itemId = $(this).data('id');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/deleteErayga/${itemId}`,
                    method: 'DELETE',
                    success: function() {
                        fetchEraygaHadalka();
                        Swal.fire('Deleted!', 'Erayga Hadalka has been deleted.', 'success');
                    },
                    error: function(error) {
                        Swal.fire('Error', 'Failed to delete Erayga Hadalka', 'error');
                    }
                });
            }
        });
    });
});
