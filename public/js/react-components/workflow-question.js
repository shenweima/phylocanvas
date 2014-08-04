/** @jsx React.DOM */

var WorkflowQuestionAnswerButton = React.createClass({displayName: 'WorkflowQuestionAnswerButton',
    handleClick: function() {
        this.props.onToggle(false);
    },
    render: function() {
        var classes = React.addons.classSet({
            'wgst-workflow-question-answer-button': true
        });
        return (
            React.DOM.button({className: classes, 'data-answer-value': this.props.value, onClick: this.handleClick}, this.props.label)
        );
    }
});

var WorkflowQuestionTitle = React.createClass({displayName: 'WorkflowQuestionTitle',
    render: function() {
        return (
            React.DOM.header(null, 
                React.DOM.h3(null, this.props.title)
            )
        );
    }
});

var WorkflowQuestion = React.createClass({displayName: 'WorkflowQuestion',
    getInitialState: function() {
        return { show: true };
    },
    handleToggle: function(show) {
        this.setState({
            show: show
        });
    },
    render: function() {
        var that = this;
        var buttons = this.props.buttons.map(function(button){
            return (WorkflowQuestionAnswerButton({
                        label: button.label, 
                        value: button.value, 
                        onToggle: that.handleToggle}));
        });

        if (this.state.show) {
            return (
                React.DOM.article({className: "wgst-workflow-question"}, 
                    React.DOM.section(null, 
                        WorkflowQuestionTitle({title: this.props.title}), 
                        React.DOM.div(null, buttons)
                    )
                )
            );
        } else {
            return null;
        }
    }
});