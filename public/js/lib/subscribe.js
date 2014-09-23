$(function(){

	(function(){

        //
        // Subscribe form
        //
        $('body').on('submit', '[data-form="subscribe"]', function(event){
            console.log('[WGST] Submitting subscribe form...');

            event.preventDefault();

            var $form = $('[data-form="subscribe"]'),
                email = $form.find('[data-input="email"]').val();

            //
            // Validate
            //
            if (typeof email === 'undefined' || email === '') {
                console.error('[WGST][Validation][Error] ✗ No email');
                return;
            }

            var $button = $(this).find('[type="submit"]');

            $button.prop('disabled', true);
            $button.find('span').addClass('wgst--hide-this');
            $button.find('.wgst-spinner').removeClass('wgst--hide-this');


            var result = {
                email: email
            };

            console.dir(result);

            //
            // Submit subsription
            //
            $.ajax({
                type: 'POST',
                url: '/subscribe/',
                // http://stackoverflow.com/a/9155217
                datatype: 'json',
                data: result
            })
            .done(function(data, textStatus, jqXHR) {
                console.log('[WGST] Subscribed');

                $button.addClass('wgst--hide-this');

                $('.wgst-subscribe-success-message').removeClass('wgst--hide-this');

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log('[WGST][Error] Failed to subscribe');
                console.error(textStatus);
                console.error(errorThrown);
                console.error(jqXHR);
            });
        });

	})();

});