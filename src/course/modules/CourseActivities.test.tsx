import {fireEvent,render,screen,cleanup} from '@testing-library/react';
import {CourseActivity} from './CourseActivities';
beforeEach(()=>localStorage.clear());
afterEach(cleanup);
it('preserves submitted numerical feedback on return and does not complete a wrong calculation',()=>{
  const done=vi.fn();
  const {unmount}=render(<CourseActivity kind="normalization" onComplete={done}/>);
  fireEvent.change(screen.getByLabelText('Your numerical answer'),{target:{value:'0.25'}});
  fireEvent.click(screen.getByRole('button',{name:'Check calculation'}));
  expect(done).not.toHaveBeenCalled();expect(screen.getByRole('status')).toHaveTextContent('Revisit');
  fireEvent.change(screen.getByLabelText('Your numerical answer'),{target:{value:'0.5'}});
  fireEvent.click(screen.getByRole('button',{name:'Check calculation'}));
  expect(done).toHaveBeenCalledTimes(1);
  unmount();render(<CourseActivity kind="normalization" onComplete={vi.fn()}/>);
  expect(screen.getByLabelText('Your numerical answer')).toHaveValue(.5);
  expect(screen.getByRole('status')).toHaveTextContent('That calculation fits');
});
it('resets k-means to a valid starting state when k changes',()=>{
  render(<CourseActivity kind="kmeans" onComplete={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'Update centers'}));
  expect(screen.getByRole('button',{name:'Previous step'})).not.toBeDisabled();
  fireEvent.change(screen.getByRole('slider',{name:'Number of clusters'}),{target:{value:'5'}});
  expect(screen.getByRole('button',{name:'Previous step'})).toBeDisabled();
  expect(screen.getByText(/Cluster 5:/)).toBeVisible();
});
it('starts numeric challenges without a preselected answer',()=>{
  render(<CourseActivity kind="silhouette" onComplete={()=>{}}/>);
  expect(screen.getByLabelText('Your numerical answer')).toHaveValue(null);
  expect(screen.getByRole('button',{name:'Check calculation'})).toBeDisabled();
});
