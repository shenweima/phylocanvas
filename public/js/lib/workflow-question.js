/** @jsx React.DOM */

var WorkflowQuestion = React.createClass({displayName: 'WorkflowQuestion',
    render: function() {
        return (
        	React.DOM.article({class: "wgst-workflow-question"}, 
        		WorkflowQuestionTitle(null), 
        		WorkflowQuestionAnswerButton(null), 
        		WorkflowQuestionAnswerButton(null)
        	)
        );
    }
});

var WorkflowQuestionTitle = React.createClass({displayName: 'WorkflowQuestionTitle',
    render: function() {
        return (
			React.DOM.header(null, 
				React.DOM.h3(null, "What is the question?")
			)
        );
    }
});

var WorkflowQuestionAnswerButton = React.createClass({displayName: 'WorkflowQuestionAnswerButton',
    render: function() {
        return (
        	React.DOM.button({class: "wgst-workflow-question-answer-button", 'data-answer-value': "{this.prop.value}"}, this.prop.label)
        );
    }
});