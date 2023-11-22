import type { FunctionalComponent } from 'vue'

interface Props {
  title: string
}
const Title: FunctionalComponent<Props> = ({ title }) => {
  return <h1>{title}</h1>
}
Title.props = {
  title: String
}
export default Title
