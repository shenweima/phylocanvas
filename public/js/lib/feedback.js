$(function(){

	(function(){

        //
        // Feedback form
        //
        $('body').on('submit', '[data-form="feedback"]', function(event){
            console.log('[WGST] Submitting feedback form...');

            event.preventDefault();

            var $button = $(this).find('[type="submit"]');

            $button.prop('disabled', true);
            $button.find('span').addClass('wgst--hide-this');
            $button.find('.wgst-spinner').removeClass('wgst--hide-this');

            var $form = $('[data-form="feedback"]');

            var name = $form.find('[data-input="name"]').val(),
                email = $form.find('[data-input="email"]').val(),
                feedback = $form.find('[data-input="feedback"]').val();

            var result = {
                name: name,
                email: email,
                feedback: feedback
            };

            console.dir(result);

            window.WGST.exports.mixpanel.submitFeedback();

            // Get collection data
            $.ajax({
                type: 'POST',
                url: '/feedback/',
                // http://stackoverflow.com/a/9155217
                datatype: 'json',
                data: result
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('[WGST] Sent feedback');

                $button.addClass('wgst--hide-this');

                $('.wgst-send-feedback-success-message').removeClass('wgst--hide-this');

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][Error] Failed to send feedback');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });
        });

	})();

});