import {¬†AiFillGithub, AiFillTwitterCircle } from 'react-icons/ai'
import './footer.css'

export default function Footer(props) {
  return (
    <div className="Footer">
      <a className="link" target="_blank" rel="noreferrer" href="https://blog.yaynay.app/">About</a>
      <a className="icon firstIcon" target="_blank" rel="noreferrer" href="https://github.com/yaynayapp"><AiFillGithub /></a>
      <a className="icon lastIcon" target="_blank" rel="noreferrer" href="https://twitter.com/appyaynay"><AiFillTwitterCircle /></a>
      <a className="link" target="_blank" rel="noreferrer" href="https://github.com/yaynayapp/docs/blob/main/LEGAL.md">Legal</a>
    </div>
  )
}
