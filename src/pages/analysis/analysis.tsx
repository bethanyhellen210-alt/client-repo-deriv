import { DBOT_TABS } from '@/constants/bot-contents';
import DigitPanel from '@/pages/bot-builder/digit-panel/digit-panel';
import { useStore } from '@/hooks/useStore';
import { observer } from 'mobx-react-lite';
import RunStrategy from '@/pages/dashboard/run-strategy';

const Analysis = () => {
    const { dashboard } = useStore();

    return (
        <div className='digit-panel-page'>
            <div className='analysis-run-control'>
                <RunStrategy />
            </div>
            <DigitPanel onClose={() => dashboard.setActiveTab(DBOT_TABS.BOT_BUILDER)} />
        </div>
    );
};

export default observer(Analysis);
